/* eslint-disable no-prototype-builtins */
const handlebars = require('handlebars')
const fs = require('fs')
const path = require('path')
const solc = require('solc')
const types = [
  'bool',
  'int',
  'uint',
  'fixed',
  'ufixed',
  'address',
  'string',
  'byte',
  'bytes',
  'enum'
]

const Schema = function (modelDef, contractSP, web3provider) {
  let isDeployed = false
  const web3 = web3provider
  let idType
  this.account = undefined
  const modelDefinition = modelDef
  let propertyNames = []
  const contractSavePath = contractSP
  let idField
  let contractDeployed
  const name = modelDef.contractName
  let transactionOptions = {}

  function validate () {
    let idFound = 0
    for (let i = 1; i <= 32; i++) {
      types.push('bytes' + i)
    }

    if (!modelDefinition.hasOwnProperty('name')) {
      throw new Error('name property is required')
    }

    if (!modelDefinition.hasOwnProperty('contractName')) {
      throw new Error('contractName property is required')
    }

    if (!Array.isArray(modelDefinition.properties)) {
      throw new TypeError('properties must be an array')
    }
    propertyNames = modelDefinition.properties.map(prop => prop.name)
    for (const index in modelDefinition.properties) {
      if (!modelDefinition.properties[index].name) {
        throw new Error('Property at index ' + index + ' is missing name')
      }
      if (!modelDefinition.properties[index].type) {
        throw new Error('Property at index ' + index + ' is missing type')
      }
      if (!types.includes(modelDefinition.properties[index].type)) {
        throw new TypeError('Property at index ' + index + ' has wrong type.')
      }
      if (modelDefinition.properties[index].type === 'enum') {
        if (!modelDefinition.properties[index].values) {
          throw new TypeError('Property at index ' + index + ' is missing \'values\' property which is mandatory for fields of type enum.')
        }
        if (!modelDefinition.properties[index].defaultValue) {
          throw new TypeError('Property at index ' + index + ' is missing \'defaultValue\' property which is mandatory for fields of type enum.')
        }
        if (!modelDefinition.properties[index].values.includes(modelDefinition.properties[index].defaultValue)) {
          throw new TypeError('Property at index ' + index + ' \'defaultValue\' is not included in the set of \'values\'. The defaultValue of an enum type must be included in the set of values.')
        }
        const valuesSet = new Set(modelDefinition.properties[index].values)
        if (valuesSet.length !== modelDefinition.properties[index].values.length) {
          throw new TypeError('Property at index ' + index + ' \'values\' must contain only unique values. It seems duplicate values exist')
        }
      }
      if (modelDefinition.properties[index].hasOwnProperty('primaryKey')) {
        if (modelDefinition.properties[index].primaryKey) {
          idFound += 1
          idField = modelDefinition.properties[index].name
          idType = modelDefinition.properties[index].type
        }
      }
    }
    if (idFound === 0 || idFound > 1) {
      throw new Error('One property must be primary key of the model.')
    }
  }

  function preprocessId (Id) {
    return idType.includes('bytes') ? web3.utils.asciiToHex(Id) : Id
  }

  function generateContract (modelDefinition, contractSavePath, callback) {
    // eslint-disable-next-line no-undef
    const file = path.resolve(__dirname, './contractTemplate.txt')
    const templateFile = fs.readFileSync(file, 'utf8')
    const handlebarTemplate = handlebars.compile(templateFile)
    const contractResult = handlebarTemplate({
      contract: {
        name: modelDefinition.contractName,
        structName: modelDefinition.name,
        idDataType: idType,
        license: modelDefinition.license || 'UNLICENSED'
      }
    })

    fs.writeFile(contractSavePath + '/' + modelDefinition.contractName + '.sol', contractResult, function (err) {
      if (err) {
        /* istanbul ignore next */
        return callback(err, undefined)
      }
      return callback(null, {
        contract: contractSavePath + '/' + modelDefinition.contractName + '.sol'
      })
    })
  }

  this.setAccount = function (accountToSet) {
    this.account = accountToSet
  }

  this.deploy = function (callback) {
    if (isDeployed) {
      return callback(new Error('Model ' + name + ' is already deployed.'), false)
    }
    const self = this
    generateContract(modelDefinition, contractSavePath, function (err, generatedContract) {
      if (!err) {
        const inputContract = fs.readFileSync(generatedContract.contract).toString()
        const input = {
          language: 'Solidity',
          sources: {},
          settings: {
            outputSelection: {
              '*': {
                '*': ['*']
              }
            }
          }
        }
        const fn = modelDefinition.contractName + '.sol'
        input.sources[fn] = {
          content: inputContract
        }
        const output = JSON.parse(solc.compile(JSON.stringify(input)))
        if (output.hasOwnProperty('errors')) {
          /* istanbul ignore next */
          return callback(new Error('Solidity compilation error \n' + JSON.stringify(output.errors)), false)
        }

        const bytecode = output.contracts[fn][modelDefinition.contractName].evm.bytecode.object
        const abi = output.contracts[fn][modelDefinition.contractName].abi
        const contract = new web3.eth.Contract(abi)
        if (!self.account) {
          web3.eth.getAccounts(function (err, accounts) {
            if (!err) {
              self.account = accounts[1]
              transactionOptions = {
                from: self.account,
                gas: 150000000,
                gasPrice: '30000000000000'
              }
              contractDeploy(contract, bytecode, function (err, contr) {
                if (err) {
                  /* istanbul ignore next */
                  return callback(err, false)
                }
                isDeployed = true
                contractDeployed = contr
                return callback(null, true)
              })
            } else {
              return callback(err, false)
            }
          })
        } else {
          transactionOptions = {
            from: self.account,
            gas: 150000000,
            gasPrice: '30000000000000'
          }
          contractDeploy(contract, bytecode, function (err, contr) {
            if (err) {
              /* istanbul ignore next */
              return callback(err, false)
            }
            isDeployed = true
            contractDeployed = contr
            return callback(null, true)
          })
        }
      } else {
        /* istanbul ignore next */
        return callback(err, false)
      }
    })
  }

  function contractDeploy (contract, bytecode, callback) {
    contract.deploy({
      data: '0x' + bytecode
    })
      .send(transactionOptions).then(function (newContractInstance) {
        return callback(null, newContractInstance)
      }).catch(function (err) {
        /* istanbul ignore next */
        return callback(err, null)
      })
  }

  this.save = function (newValue, callback) {
    if (!contractDeployed) {
      return callback(new Error('Model is not deployed'), undefined)
    }
    if (!newValue.hasOwnProperty(idField)) {
      return callback(new Error('Primary key field does not exist'), undefined)
    }
    if (Object.keys(newValue).toString() !== propertyNames.toString()) {
      return callback(new Error('Instance does not match Schema definition'), undefined)
    }
    const idToAdd = preprocessId(newValue[idField])
    contractDeployed.methods.addRecord(JSON.stringify(newValue), idToAdd).send(transactionOptions)
      .then(function () {
        return callback(null, newValue)
      }).catch(function (error) {
        /* istanbul ignore next */
        return callback(error, undefined)
      })
  }

  this.find = function (callback) {
    // returns all records
    if (!contractDeployed) {
      return callback(new Error('Model is not deployed'), undefined)
    }
    contractDeployed.methods.getAllRecords().call().then(function (resp) {
      return resp.map(JSON.parse)
    }).then(function (resp) {
      return callback(null, resp)
    }, function (error) {
      /* istanbul ignore next */
      return callback(error, undefined)
    })
  }

  this.findById = function (Id, callback) {
    if (!contractDeployed) {
      return callback(new Error('Model is not deployed'), undefined)
    }
    const idToLook = preprocessId(Id)
    contractDeployed.methods.getRecord(idToLook).call().then(function (resp) {
      return callback(null, JSON.parse(resp))
    }).catch(function (error) {
      /* istanbul ignore next */
      return callback(error, undefined)
    })
  }

  this.deleteById = function (Id, callback) {
    if (!contractDeployed) {
      return callback(new Error('Model is not deployed'), undefined)
    }
    const idToLook = preprocessId(Id)
    contractDeployed.methods.deleteRecord(idToLook).send(transactionOptions).then(function () {
      return callback(null, true)
    }).catch(function (error) {
      /* istanbul ignore next */
      return callback(error, false)
    })
  }

  this.updateById = function (Id, newValue, callback) {
    if (!contractDeployed) {
      return callback(new Error('Model is not deployed'), undefined)
    }
    const idToLook = preprocessId(Id)
    if (Object.keys(newValue).toString() !== propertyNames.toString()) {
      return callback(new Error('Instance does not match Schema definition'), undefined)
    }
    contractDeployed.methods.updateRecord(idToLook, JSON.stringify(newValue)).send(transactionOptions)
      .then(function () {
        return callback(null, newValue)
      }).catch(function (error) {
        /* istanbul ignore next */
        return callback(error, false)
      })
  }
  validate()
  return this
}
module.exports = Schema
