var expect = require('chai').expect;
var describe = require('mocha').describe;
var after = require('mocha').after;
var before = require('mocha').before;
var it = require('mocha').it;
var chai = require('chai');
var ethAirBalloons = require('../');
var path = require('path');
var ethAirBalloonsProvider;

before(function (done) {
    var savePath = path.resolve(__dirname + '/contracts');
    ethAirBalloonsProvider = ethAirBalloons('http://localhost:8545', savePath);
    setTimeout(done, 1000);
});

describe('testing create schema', function () {
    var CarSchema;
    before(function (done) {
        CarSchema = ethAirBalloonsProvider.createSchema({
            name: "Car",
            contractName: "carsContract",
            properties: [
                {
                    name: "engine",
                    type: "bytes32",
                    primaryKey: true
                },
                {
                    name: "wheels",
                    type: "uint"
                }
            ]
        });
        done();
    });
    it('should have function deploy', function () {
        expect(CarSchema).to.have.property('deploy').that.is.a('function');
    });
    it('should have function save', function () {
        expect(CarSchema).to.have.property('save').that.is.a('function');
    });
    it('should have function find', function () {
        expect(CarSchema).to.have.property('find').that.is.a('function');
    });
    it('should have function findById', function () {
        expect(CarSchema).to.have.property('findById').that.is.a('function');
    });
    it('should have function deleteById', function () {
        expect(CarSchema).to.have.property('findById').that.is.a('function');
    });
});