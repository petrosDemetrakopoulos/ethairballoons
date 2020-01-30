var handlebars = require('module');
var Web3 = require('web3');
var Schema = require('./Schema.js');

var ethAirBalloons = function (ipAddress, contractSavePath) {
//contract path must be specified in constructor
	var web3 = new Web3(new Web3.providers.WebsocketProvider(ipAddress));

	this.createSchema = function (modelDefinition) {
		if (!web3){
			throw new Error('You must set the Ethereum blockchain provider IP');
		}
		if (!contractSavePath) {
			throw new Error('You must set a path where generated Smart contracts will be stored');
		}
		return new Schema (modelDefinition, contractSavePath, web3);

	};

	return this;

};

module.exports = ethAirBalloons;
