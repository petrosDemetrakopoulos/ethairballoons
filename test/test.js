var expect = require('chai').expect;
var describe = require('mocha').describe;
var before = require('mocha').before;
var it = require('mocha').it;
var ethAirBalloons = require('../lib');
var path = require('path');
var ethAirBalloonsProvider;
var ethairBaloonsNoSavePath;
var CarSchema;
before(function (done) {
    var savePath = path.resolve(__dirname + '/contracts');
    ethAirBalloonsProvider = new ethAirBalloons('http://localhost:8545', savePath);
    ethairBaloonsNoSavePath = new ethAirBalloons('http://localhost:8545', null);
    ethairBaloonsNoSavePath = new ethAirBalloons('http://localhost:8545', null);
    setTimeout(done, 1000);
});

describe('testing create schema', function () {
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

describe('testing create schema without contract save path', function () {
    it("should throw 'You must set a path where generated Smart contracts will be stored' error", function (done) {
        expect(() => ethairBaloonsNoSavePath.createSchema({
            name: "Car",
            contractName: "carContracts",
            properties: [
                {
                    name: "engine",
                    type: "bytes32",
                    isPrimaryKey: true
                },
                {
                    name: "wheels",
                    type: "uint"
                }
            ]
        })).to.throw('You must set a path where generated Smart contracts will be stored');
        done();
    });
});

describe('testing save() function when not deployed', function () {
    it("should return 'Model is not deployed error'", function (done) {
        var newCarObject = {engine: "V8", wheels: 4};
        CarSchema.save(newCarObject, function (res, err) {
            expect(err.message).equal('Model is not deployed');
            done();
        });
    });
});

describe('testing find() function when not deployed', function () {
    it("should return 'Model is not deployed error'", function (done) {
        CarSchema.find(function (res, err) {
            expect(err.message).equal('Model is not deployed');
            done();
        });
    });
});

describe('testing findById() function when not deployed', function () {
    it("should return 'Model is not deployed error'", function (done) {
        CarSchema.findById('V8', function (res, err) {
            expect(err.message).equal('Model is not deployed');
            done();
        });
    });
});

describe('testing deploy() function', function () {
    it("should return true", function (done) {
        CarSchema.deploy(function (success, err) {
            expect(success).to.equal(true);
            done();
        });
    });
});

describe('testing save() function when deployed', function () {
    it("should return true", function (done) {
        var newCarObject = {engine: "V8", wheels: 4};
        CarSchema.save(newCarObject, function (res, err) {
            expect(res).to.deep.equal({engine: "V8", wheels: 4});
            done();
        });
    });
});

describe('testing find() function', function () {
    it("should contain {engine: \"V8\", wheels: 4}", function (done) {
        CarSchema.find(function (res, err) {
            expect(res).deep.include(({engine: 'V8', wheels: 4}));
            done();
        });
    });
});

describe('testing findById() function', function () {
    it("should return {engine: \"V8\", wheels: 4}", function (done) {
        CarSchema.findById('V8',function (res, err) {
            expect(res).deep.equal({engine: "V8", wheels: 4});
            done();
        });
    });
});

describe('testing deleteById() function', function () {
    it("should return true", function (done) {
        CarSchema.deleteById('V8',function (res, err) {
            expect(res).to.equal(true);
            done();
        });
    });
});

describe('testing deploy() function when already deployed', function () {
    it("should return error ''", function (done) {
        CarSchema.deploy(function (success, err) {
            expect(err.message).to.equal('Model carsContract is already deployed.');
            done();
        });
    });
});

describe('testing deploy() fail schema', function () {
    it("should throw error 'name property is required'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
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
        })).to.throw('name property is required');
        done();
    });

    it("should throw error 'contractName property is required'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
            name: "Car",
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
        })).to.throw('contractName property is required');
        done();
    });

    it("should throw error 'contractName property is required'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
            name: "Car",
            contractName: "carContracts",
            properties: "not an array properties"
        })).to.throw('properties must be an array');
        done();
    });

    it("should throw error 'Property at index 0 is missing name'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
            name: "Car",
            contractName: "carContracts",
            properties: [
                {
                    type: "bytes32",
                    primaryKey: true
                },
                {
                    name: "wheels",
                    type: "uint"
                }
            ]
        })).to.throw('Property at index 0 is missing name');
        done();
    });

    it("should throw error 'Property at index 0 is missing type'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
            name: "Car",
            contractName: "carContracts",
            properties: [
                {
                    name: "engine",
                    primaryKey: true
                },
                {
                    name: "wheels",
                    type: "uint"
                }
            ]
        })).to.throw('Property at index 0 is missing type');
        done();
    });

    it("should throw error 'Property at index 0 has wrong type'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
            name: "Car",
            contractName: "carContracts",
            properties: [
                {
                    name: "engine",
                    type: "anInvalidType",
                    primaryKey: true
                },
                {
                    name: "wheels",
                    type: "uint"
                }
            ]
        })).to.throw('Property at index 0 has wrong type.');
        done();
    });

    it("should throw error 'Property at index 0 has wrong type'", function (done) {
        expect(() => ethAirBalloonsProvider.createSchema({
            name: "Car",
            contractName: "carContracts",
            properties: [
                {
                    name: "engine",
                    type: "bytes32"
                },
                {
                    name: "wheels",
                    type: "uint"
                }
            ]
        })).to.throw('One property must be primary key of the model.');
        done();
    });
});
