const handlebars = require('module');
const Web3 = require('web3');
const Schema = require('./Schema.js');

let web3;
let contractsDeployed = new Map();
const ethAirBaloons = function(ipAddress, contractSavePath) {
//contract path must be specified in constructor
	web3 = new Web3(new Web3.providers.WebsocketProvider(ipAddress));

	 this.createSchema = function (modelDefinition) {
		if (!web3){
			throw new Error('You must set the ethereum blockchain provider IP');
		}
		if (!contractSavePath) {
			throw new Error('You must set a path where generated Smart contracts will be stored');
		}
		const newSchema = Schema (modelDefinition, contractSavePath);
		newSchema.web3 = web3;

		if(newSchema){
			contractsDeployed.set(newSchema.name, newSchema);
		}
		return newSchema;
};

return this;

};

module.exports = ethAirBaloons;
