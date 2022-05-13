const _ = require('lodash')
const { isAddress } = require('web3-utils')
const { tokenTypes } = require('../constants')

const verifierParamInput = (paramVals = {}, paramTypes = []) => {
  const signedParamTypes = _.filter(paramTypes, { signed: true })

  const numParams = _.keys(paramVals).length
  if (numParams !== signedParamTypes.length) {
    throw new Error(`Wrong number of parameters. Expected ${signedParamTypes.length} but got ${numParams}`)
  }

  _.forEach(paramVals, (paramVal, paramName) => {
    const paramDef = _.find(paramTypes, { name: paramName })
    if (!paramDef) {
      throw new Error(`Unknown parameter ${paramName}`)
    }
    const { name, type: paramType, signed } = paramDef
    if (!signed) {
      throw new Error(`Param ${name} is not a signed parameter`)
    }

    if (tokenTypes.includes(paramType) || paramType.toLowerCase() == 'address') {
      if (!isAddress(paramVal)) {
        throw new Error(`Param ${name}=${paramVal} is not a valid address`)
      }
    } else if (paramType.toLowerCase().includes('uint')) {
      let uintVal, parseErr
      try {
        uintVal = parseInt(paramVal)
      } catch (err) {
        parseErr = err
      }
      if (parseErr || _.isNaN(uintVal)) {
        throw new Error(`Param ${name}=${paramVal} is not a valid uint`)
      }
      if (uintVal < 0) {
        throw new Error(`Param ${name} cannot be negative`)
      }
    } else {
      if (!_.isString(paramVal) && !_.isArray(paramVal)) {
        throw new Error(`Param ${name}=${paramVal} is not valid`)
      }
    }
  })
}

module.exports = verifierParamInput
