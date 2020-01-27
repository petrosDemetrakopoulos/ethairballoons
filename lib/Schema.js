const handlebars = require('handlebars');
const fs = require('fs');
const path = require("path");
const solc = require("solc");
let types = [
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


const Schema = function (modelDefinition, contractSavePath) {
	console.log(modelDefinition);
	this.isDeployed = false;
	this.web3;
	this.validate = function() {

		let idFound = 0;
		let idField;
		for (let i = 1; i <= 32; i++) {
			types.push("bytes" + i);
		}

		if (!modelDefinition.hasOwnProperty('name')) {
			throw new Error('name property is required');
		}

		if (!modelDefinition.hasOwnProperty('contractName')) {
			throw new Error('contractName property is required');
		}

		if (!Array.isArray(modelDefinition.properties)) {
			throw new TypeError('Properties must be an array');
		}

		for (let index in modelDefinition.properties) {
			if (!modelDefinition.properties[index].name) {
				throw new Error('Property at index ' + index + ' is missing name');
			}
			if (!modelDefinition.properties[index].type) {
				throw new Error('Property at index ' + index + ' is missing type');
			}
			if (!types.includes(modelDefinition.properties[index].type)){
				throw new TypeError('Propery at index ' + index + ' has wrong type. \n Type must be one of the following:' + types);
			}
			if(modelDefinition.properties[index].hasOwnProperty('primaryKey')){
				if (modelDefinition.properties[index].primaryKey) {
					idFound += 1;
					idField = modelDefinition.properties[index].name;
				}
			}
		}
		if (idFound === 0 || idFound > 1) {
			throw new Error('One property must be primary key of the model.');
		}
	}

	function generateContract(modelDefinition, contractSavePath) {
		let contract = {name: modelDefinition.contractName, structName: modelDefinition.name};
		const file = path.resolve(__dirname, "./contractTemplate.txt");
		const templateFile = fs.readFileSync(file, "utf8");
		const handlebarTemplate = handlebars.compile(templateFile);
		const contractResult = handlebarTemplate({ contract: { name:  this.contractName, structName: this.name } });
		//fn = ABCDE.sol
		//contractName = ABCDE
		return new Promise(function (resolve, reject) {
			console.log(contractSavePath);
			fs.writeFile(contractSavePath + '/' + modelDefinition.contractName + '.sol', contractResult, function (err) {
				if (err) {
					console.log(err);
					return reject(new Error('Error during contract generation'));
				}
				console.log('******************');
				console.log('Contract generated!');
				console.log('******************');
				return resolve({contract: contractSavePath + '/' + modelDefinition.contractName + '.sol'});
			});
		});
	}

	this.deploy = async function(callback) {
		if (this.isDeployed) {
			throw new Error('Model ' + this.name + " is already deployed.");
		}
		generateContract(modelDefinition, contractSavePath).then(async generatedContract => {
			console.log('contract Generated Successfully on ' + JSON.stringify(generatedContract));
			const inputContract = fs.readFileSync(generatedContract.contract).toString();
			let input = {
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
			let fn = this.contractName + '.sol'
			input.sources[fn] = { content: inputContract };
			const output = JSON.parse(solc.compile(JSON.stringify(input)));
			const bytecode = output.contracts[fn][this.contractName].evm.bytecode.object;
			const abi = output.contracts[fn][this.contractName].abi;
			let rec = {};
			let contract = new this.web3.eth.Contract(abi);
			if (!this.account) {
				await web3.eth.getAccounts(function (err, accounts) {
					if (!err) {
						contractDeploy(contract, bytecode, accounts[1], function(contr, err){
							if(err){
								return callback(null, err);
							}
							return callback(contr, null);
						});
					} else {
						return callback(null, err);
					}
				});
			} else {
				contractDeploy(contract, bytecode, this.account, function(contr, err){
					if(err){
						return callback(null, err);
					}
					return callback(contr, null);
				});
			}

		}).catch(err => {
			return callback(null, err);
		})
		this.isDeployed = true;
	}

	function contractDeploy(contract, bytecode, account, callback) {
			contract.deploy({ data: '0x' + bytecode })
			.send({
				from: account,
				gas: 150000000,
				gasPrice: '30000000000000'
			}).then(function(newContractInstance){
    			console.log(newContractInstance.options.address) // instance with the new contract address
    			callback(newContractInstance);
			}).catch(function(err){
				callback(null, err);
			});
	}

	this.save = function (newValue) {
		
	}

	this.find = function() {
		//return all
	}

	this.findById = function (Id) {
		
	}

	this.deleteById = function() {

	}

	this.update = function(newValue) {

	}
	this.name = modelDefinition.name;
	this.contractName = modelDefinition.contractName;
	validate();
	console.log('Schema successfully created');
	return this;
}
module.exports = Schema;