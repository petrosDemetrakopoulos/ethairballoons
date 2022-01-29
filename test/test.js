/* eslint node/handle-callback-err: "off" */
/* eslint handle-callback-err: "off" */
/* eslint array-callback-return: "off" */
const expect = require('chai').expect
const describe = require('mocha').describe
const before = require('mocha').before
const after = require('mocha').after
const it = require('mocha').it
const ganache = require('ganache')
const EthAirBalloons = require('../lib')
const path = require('path')
const Web3 = require('web3')
let ethAirBalloonsProvider
let ethairBalloonsNoSavePath
let ethairBaloonsAccountSet
let ethairBaloonsNoPK
let ethairBlloonsNoProviderSet
let CarSchema
let carSchemaNoAccount
let failedSchema
let account
let ganacheServer

before('Setup ganache server', function (done) {
  ganacheServer = ganache.server({
    // means we can create as complex function calls as we want
    gasLimit: Number.MAX_SAFE_INTEGER,
    // means we have unlimited $$$ to run stuff on the Ethereum network
    default_balance_ether: Number.MAX_SAFE_INTEGER,
    logger: {
      log () { return '' }
    }
  })
  ganacheServer.listen(8545, done)
})

before(function (done) {
  const savePath = path.join(__dirname, '/contracts')
  ethAirBalloonsProvider = new EthAirBalloons('http://localhost:8545', savePath)
  ethairBalloonsNoSavePath = new EthAirBalloons('http://localhost:8545', null)
  ethairBaloonsAccountSet = new EthAirBalloons('http://localhost:8545', savePath)
  ethairBaloonsNoPK = new EthAirBalloons('http://localhost:8545', savePath)
  ethairBlloonsNoProviderSet = new EthAirBalloons('http://localhost:8900', savePath)
  const web3 = new Web3(new Web3.providers.WebsocketProvider('http://localhost:8545'))
  web3.eth.getAccounts(function (err, accounts) {
    if (!err) {
      account = accounts[1]
      setTimeout(done, 1200)
    }
  })
})

after('Close ganache server', function () {
  if (ganacheServer) {
    ganacheServer.close()
  }
})

describe('testing create schema', function () {
  before(function (done) {
    CarSchema = ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carsContract',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        },
        {
          name: 'style',
          type: 'enum',
          values: ['coupe', 'convertible'],
          defaultValue: 'coupe'
        }
      ]
    })
    it('should have function deploy', function () {
      expect(CarSchema).to.have.property('deploy').that.is.a('function')
    })
    it('should have function save', function () {
      expect(CarSchema).to.have.property('save').that.is.a('function')
    })
    it('should have function find', function () {
      expect(CarSchema).to.have.property('find').that.is.a('function')
    })
    it('should have function findById', function () {
      expect(CarSchema).to.have.property('findById').that.is.a('function')
    })
    it('should have function deleteById', function () {
      expect(CarSchema).to.have.property('findById').that.is.a('function')
    })
    it('should have function updateById', function () {
      expect(CarSchema).to.have.property('updateById').that.is.a('function')
    })
    done()
  })
})

describe('testing create schema without contract save path', function () {
  it('should throw \'You must set a path where generated Smart contracts will be stored\' error', function (done) {
    expect(() => ethairBalloonsNoSavePath.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          isPrimaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('You must set a path where generated Smart contracts will be stored')
    done()
  })
})

describe('testing create schema without primary key', function () {
  it('should throw \'One property must be primary key of the model.\' error', function (done) {
    expect(() => ethairBaloonsNoPK.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32'
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('One property must be primary key of the model.')
    done()
  })
})

describe('testing create schema with account set', function () {
  before(function (done) {
    CarSchema = ethairBaloonsAccountSet.createSchema({
      name: 'Car',
      contractName: 'carsContract',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })
    CarSchema.setAccount(account)
    done()
  })
  it('should have function deploy', function () {
    expect(CarSchema).to.have.property('deploy').that.is.a('function')
  })
  it('should have function save', function () {
    expect(CarSchema).to.have.property('save').that.is.a('function')
  })
  it('should have function find', function () {
    expect(CarSchema).to.have.property('find').that.is.a('function')
  })
  it('should have function findById', function () {
    expect(CarSchema).to.have.property('findById').that.is.a('function')
  })
  it('should have function deleteById', function () {
    expect(CarSchema).to.have.property('findById').that.is.a('function')
  })
  it('should have function updateById', function () {
    expect(CarSchema).to.have.property('updateById').that.is.a('function')
  })
})

describe('testing deploy() function when account is not set', function () {
  before(function (done) {
    carSchemaNoAccount = ethAirBalloonsProvider.createSchema({
      name: 'CarNoAcc',
      contractName: 'carsContractNoAcc',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })
    done()
  })
  it('should return false', function (done) {
    carSchemaNoAccount.deploy(function (err, success) {
      expect(success).to.equal(false)
      done()
    })
  })
})

describe('testing save() function when not deployed', function () {
  it('should return \'Model is not deployed error\'', function (done) {
    const newCarObject = { engine: 'V8', wheels: 4 }
    CarSchema.save(newCarObject, function (err, res) {
      expect(err.message).equal('Model is not deployed')
      done()
    })
  })
})

describe('testing find() function when not deployed', function () {
  it('should return \'Model is not deployed error\'', function (done) {
    CarSchema.find(function (err, res) {
      expect(err.message).equal('Model is not deployed')
      done()
    })
  })
})

describe('testing findById() function when not deployed', function () {
  it('should return \'Model is not deployed error\'', function (done) {
    CarSchema.findById('V8', function (err, res) {
      expect(err.message).equal('Model is not deployed')
      done()
    })
  })
})

describe('testing updateById() function when not deployed', function () {
  it("should return 'Model is not deployed error'", function (done) {
    CarSchema.updateById('V8', { engine: 'V8', wheels: 8 }, function (err, res) {
      expect(err.message).equal('Model is not deployed')
      done()
    })
  })
})

describe('testing deleteById() function when not deployed', function () {
  it('should return \'Model is not deployed error\'', function (done) {
    CarSchema.deleteById('V8', function (err, res) {
      expect(err.message).equal('Model is not deployed')
      done()
    })
  })
})

describe('testing deploy() function', function () {
  it('should return true', function (done) {
    CarSchema.deploy(function (err, success) {
      expect(success).to.equal(true)
      done()
    })
  })
})

describe('testing save() function with data not matching the schema', function () {
  it('should return {engine: "V8", wheels: 4}', function (done) {
    const newCarObject = { engine: 'V8', invalidField: 4 }
    CarSchema.save(newCarObject, function (err, res) {
      expect(err.message).to.equal('Instance does not match Schema definition')
      done()
    })
  })
})

describe('testing save() function when deployed', function () {
  it('should return {engine: "V8", wheels: 4}', function (done) {
    const newCarObject = { engine: 'V8', wheels: 4 }
    CarSchema.save(newCarObject, function (err, res) {
      expect(res).to.deep.equal({ engine: 'V8', wheels: 4 })
      done()
    })
  })
})

describe('testing find() function', function () {
  it('should contain {engine: "V8", wheels: 4}', function (done) {
    CarSchema.find(function (err, res) {
      expect(res).deep.include(({ engine: 'V8', wheels: 4 }))
      done()
    })
  })
})

describe('testing findById() function', function () {
  it('should return {engine: "V8", wheels: 4}', function (done) {
    CarSchema.findById('V8', function (err, res) {
      expect(res).deep.equal({ engine: 'V8', wheels: 4 })
      done()
    })
  })
})

describe('testing updateById() function with data not matching the schema', function () {
  it('should return {engine: "V8", wheels: 4}', function (done) {
    const newCarObject = { engine: 'V8', invalidField: 4 }
    CarSchema.updateById('V8', newCarObject, function (err, res) {
      expect(err.message).to.equal('Instance does not match Schema definition')
      done()
    })
  })
})

describe('testing updateById() function', function () {
  it('should return {engine: "V8", wheels: 8}', function (done) {
    CarSchema.updateById('V8', { engine: 'V8', wheels: 8 }, function (err, res) {
      expect(res).deep.equal({ engine: 'V8', wheels: 8 })
      done()
    })
  })
})

describe('testing deleteById() function', function () {
  it('should return true', function (done) {
    CarSchema.deleteById('V8', function (err, res) {
      expect(res).to.equal(true)
      done()
    })
  })
})

describe('testing deploy() function when already deployed', function () {
  it('should return error \'Model carsContract is already deployed.\'', function (done) {
    CarSchema.deploy(function (err, success) {
      expect(err.message).to.equal('Model carsContract is already deployed.')
      done()
    })
  })
})

describe('testing save() function whithout primary key field set', function () {
  it('should return error \'Primary key field does not exist\'', function (done) {
    const newCarObject = { wheels: 4 }
    CarSchema.save(newCarObject, function (err, res) {
      expect(err.message).to.equal('Primary key field does not exist')
      done()
    })
  })
})

describe('testing deploy() fail schema', function () {
  before(function (done) {
    failedSchema = ethairBlloonsNoProviderSet.createSchema({
      name: 'Car',
      contractName: 'carsContract',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })
    done()
  })
  it('should throw error \'name property is required\'', function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      contractName: 'carsContract',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('name property is required')
    done()
  })

  it('should throw error \'contractName property is required\'', function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('contractName property is required')
    done()
  })

  it("should throw error 'contractName property is required'", function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: 'not an array properties'
    })).to.throw('properties must be an array')
    done()
  })

  it("should throw error 'Property at index 0 is missing name'", function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('Property at index 0 is missing name')
    done()
  })

  it("should throw error 'Property at index 0 is missing type'", function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('Property at index 0 is missing type')
    done()
  })

  it("should throw error 'Property at index 0 has wrong type'", function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'anInvalidType',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('Property at index 0 has wrong type.')
    done()
  })

  it("should throw error 'Property at index 0 has wrong type'", function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32'
        },
        {
          name: 'wheels',
          type: 'uint'
        }
      ]
    })).to.throw('One property must be primary key of the model.')
    done()
  })

  it('should throw error \'Property at index 2 is missing \'values\' property which is mandatory for fields of type enum.', function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        },
        {
          name: 'style',
          type: 'enum'
        }
      ]
    })).to.throw('Property at index 2 is missing \'values\' property which is mandatory for fields of type enum.')
    done()
  })

  it('should throw error \'Property at index 2 is missing \'defaultValue\' property which is mandatory for fields of type enum.', function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        },
        {
          name: 'style',
          type: 'enum',
          values: ['sedan', 'coupe']
        }
      ]
    })).to.throw('Property at index 2 is missing \'defaultValue\' property which is mandatory for fields of type enum.')
    done()
  })

  it('should throw error \'defaultValue\' is not included in the set of \'values\'. The defaultValue of an enum type must be included in the set of values.', function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        },
        {
          name: 'style',
          type: 'enum',
          values: ['sedan', 'coupe'],
          defaultValue: 'notIncludedInValues'
        }
      ]
    })).to.throw('\'defaultValue\' is not included in the set of \'values\'. The defaultValue of an enum type must be included in the set of values.')
    done()
  })

  it('should throw error Property at index 2 \'values\' must contain only unique values. It seems duplicate values exist', function (done) {
    expect(() => ethAirBalloonsProvider.createSchema({
      name: 'Car',
      contractName: 'carContracts',
      properties: [
        {
          name: 'engine',
          type: 'bytes32',
          primaryKey: true
        },
        {
          name: 'wheels',
          type: 'uint'
        },
        {
          name: 'style',
          type: 'enum',
          values: ['sedan', 'coupe', 'sedan'],
          defaultValue: 'sedan'
        }
      ]
    })).to.throw('Property at index 2 \'values\' must contain only unique values. It seems duplicate values exist')
    done()
  })

  it('should return error \'connection not open\'', function (done) {
    failedSchema.deploy(function (err, success) {
      expect(err.message).to.contain('connection not open')
      done()
    })
  })
})
