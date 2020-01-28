var handlebars = require('module');
var Web3 = require('web3');
var Schema = require('./Schema.js');

var web3;
var ethAirBaloons = function(ipAddress, contractSavePath) {
//contract path must be specified in constructor
	web3 = new Web3(new Web3.providers.WebsocketProvider(ipAddress));

	 this.createSchema = function (modelDefinition) {
		if (!web3){
			throw new Error('You must set the ethereum blockchain provider IP');
		}
		if (!contractSavePath) {
			throw new Error('You must set a path where generated Smart contracts will be stored');
		}
		var newSchema = Schema (modelDefinition, contractSavePath);
		newSchema.web3 = web3;
		return newSchema;
};

return this;

};

module.exports = ethAirBaloons;
