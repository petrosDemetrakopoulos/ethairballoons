// Copyright 2020 Petros Demetrakopoulos All rights reserved.
const Web3 = require('web3')
const Schema = require('./Schema.js')
const ethAirBalloons = function (ipAddress, contractSavePath) {
  // contract path must be specified in constructor
  const web3 = new Web3(new Web3.providers.WebsocketProvider(ipAddress))
  this.createSchema = function (modelDefinition) {
    if (!contractSavePath) {
      throw new Error('You must set a path where generated Smart contracts will be stored')
    }
    return new Schema(modelDefinition, contractSavePath, web3)
  }
  return this
}
module.exports = ethAirBalloons
