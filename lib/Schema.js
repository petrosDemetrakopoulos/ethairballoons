var handlebars = require('handlebars');
var fs = require('fs');
var path = require("path");
var solc = require("solc");
var types = [
	'bool',
	'int',
	'uint',
	'fixed',
	'ufixed',
	'address',
	'string',
	'byte',
	'bytes'
];

var Schema = function (modelDef, contractSP, web3provider) {
	var isDeployed = false;
	var web3 = web3provider;
	var idType = undefined;
	var account = undefined;
	var modelDefinition = modelDef;
	var contractSavePath = contractSP;
	var idField = undefined;
	var contractDeployed = undefined;
	var name = modelDef.contractName;

	function validate() {
		var idFound = 0;
		for (var i = 1; i <= 32; i++) {
			types.push("bytes" + i);
		}

		if (!modelDefinition.hasOwnProperty('name')) {
			throw new Error('name property is required');
		}

		if (!modelDefinition.hasOwnProperty('contractName')) {
			throw new Error('contractName property is required');
		}

		if (!Array.isArray(modelDefinition.properties)) {
			throw new TypeError('properties must be an array');
		}

		for (var index in modelDefinition.properties) {
			if (!modelDefinition.properties[index].name) {
				throw new Error('Property at index ' + index + ' is missing name');
			}
			if (!modelDefinition.properties[index].type) {
				throw new Error('Property at index ' + index + ' is missing type');
			}
			if (!types.includes(modelDefinition.properties[index].type)){
				throw new TypeError('Property at index ' + index + ' has wrong type.');
			}
			if (modelDefinition.properties[index].hasOwnProperty('primaryKey')) {
				if (modelDefinition.properties[index].primaryKey) {
					idFound += 1;
					idField = modelDefinition.properties[index].name;
					idType = modelDefinition.properties[index].type;
				}
			}
		}
		if (idFound === 0 || idFound > 1) {
			throw new Error('One property must be primary key of the model.');
		}
	}


	function generateContract (modelDefinition, contractSavePath, callback) {
		var file = path.resolve(__dirname, "./contractTemplate.txt");
		var templateFile = fs.readFileSync(file, "utf8");
		var handlebarTemplate = handlebars.compile(templateFile);
		var contractResult = handlebarTemplate({ contract: { name:  modelDefinition.contractName, structName: modelDefinition.name, idDataType: idType } });

		fs.writeFile(contractSavePath + '/' + modelDefinition.contractName + '.sol', contractResult, function (err) {
			if (err) {
				console.log(err);
				return callback(undefined, err);
			}
			return callback({contract: contractSavePath + '/' + modelDefinition.contractName + '.sol'}, undefined);
		});
	}

	this.deploy = function (callback) {
		if (isDeployed) {
			return callback(false, new Error('Model ' + name + " is already deployed."));
		}

		generateContract(modelDefinition, contractSavePath,function (generatedContract, err) {
			if (!err) {
				var inputContract = fs.readFileSync(generatedContract.contract).toString();
				var input = {
					language: 'Solidity',
					sources: {},
					settings: {
						outputSelection: {
							'*': {
								'*': ['*']
							}
						}
					}
				};
				var fn = modelDefinition.contractName + '.sol';
				input.sources[fn] = {content: inputContract};
				var output = JSON.parse(solc.compile(JSON.stringify(input)));
				if (output.hasOwnProperty('errors')) {
					return callback(false, new Error('Solidity compilation error \n' + JSON.stringify(output.errors)));
				}

				var bytecode = output.contracts[fn][modelDefinition.contractName].evm.bytecode.object;
				var abi = output.contracts[fn][modelDefinition.contractName].abi;
				var contract = new web3.eth.Contract(abi);
				if (!account) {
					web3.eth.getAccounts(function (err, accounts) {
						if (!err) {
							account = accounts[1];
							contractDeploy(contract, bytecode, account, function (contr, err) {
								if (err) {
									return callback(false, err);
								}
								isDeployed = true;
								contractDeployed = contr;
								return callback(true, null);
							});
						} else {
							return callback(false, err);
						}
					});
				} else {
					contractDeploy(contract, bytecode, account, function (contr, err) {
						if (err) {
							return callback(false, err);
						}
						isDeployed = true;
						contractDeployed = contr;
						return callback(true, null);
					});
				}
			} else {
				return callback(false, err);
			}
		});
	};

	function contractDeploy(contract, bytecode, accountToDeploy, callback) {
		contract.deploy({ data: '0x' + bytecode })
			.send({
				from: accountToDeploy,
				gas: 150000000,
				gasPrice: '30000000000000'
			}).then(function(newContractInstance) {
			return callback(newContractInstance, null);
		}).catch(function(err){
			console.log(err);
			return callback(null, err);
		});
	}

	this.save = function (newValue, callback) {
		if (!newValue.hasOwnProperty(idField)){
			return callback(undefined, new Error('Primary key field does not exist'));
		}
		if (contractDeployed) {
			var idToAdd = newValue[idField];
			if(idType.includes('bytes')){
				idToAdd = web3.utils.fromAscii(idToAdd);
			}
			contractDeployed.methods.addRecord(JSON.stringify(newValue), idToAdd).send({
				from: account,
				gas: 150000000,
				gasPrice: '30000000000000'
			}).then(function (resp) {
				return callback(newValue, undefined);
			}).catch(function (error) {
				return callback(undefined, error);
			});
		} else {
			return callback(undefined, new Error('Model is not deployed'));
		}
	};

	this.find = function (callback) {
		//returns all records
		if (contractDeployed) {
			contractDeployed.methods.getAllRecords().call().then(function (resp) {
				return callback(resp, undefined);
			}).catch(function (error) {
				return callback(undefined, error);
			});
		} else {
			return callback(undefined, new Error('Model is not deployed'));
		}
	};

	this.findById = function (Id, callback) {
		var idToLook = '';
		if(idType.includes('bytes')){
			idToLook = web3.utils.fromAscii(Id);
		}
		if (contractDeployed) {
			contractDeployed.methods.getRecord(idToLook).call().then(function (resp) {
				return callback(resp, undefined);
			}).catch(function (error) {
				return callback(undefined, error);
			});
		} else {
			return callback(undefined, new Error('Model is not deployed'));
		}
	};

	this.deleteById = function(Id, callback) {

	};

	this.update = function(newValue, callback) {

	};

	validate();
	return this;
};
module.exports = Schema;