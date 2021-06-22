const abi = require('web3-eth-abi')
const callDefs = require('./callDefs')

const decodeExecuteCallData = (params) => {
  for (let i in callDefs) {
    const callDef = callDefs[i]
    if (
      params.data && params.data.substr(0, 10) == callDef.encodedSignature
    ) {
      return _decodeCall(params, callDef)
    }
  }
}

function _decodeCall (params, callDef) {
  const { value, to, data } = params

  const callParams = data !== '0x' ? _decodeParams(`0x${data.slice(10)}`, callDef) : []

  let decodedCall = {
    callType: callDef.name
  }

  // map decoded params to new names
  for (let paramName in callParams) {
    const newParamName = callDef.mapParams && callDef.mapParams[paramName] ?
      callDef.mapParams[paramName] : paramName
    decodedCall[newParamName] = callParams[paramName]
  }

  // map 'value' to param
  const valParamName = callDef.mapValue || 'value'
  decodedCall[valParamName] = value

  // map 'to' to param
  const toParamName = callDef.mapTo || 'to'
  decodedCall[toParamName] = to

  return decodedCall
}

function _decodeParams (data, def) {
  let decodedParams

  // if data isn't right, this will throw 'data out-of-bounds' error
  // so just return null if it throws
  try {
    decodedParams = abi.decodeParameters(def.paramTypes, data)
  } catch (err) {
    return null
  }

  let params = {}
  _.forEach(decodedParams, (v, k) => {
    const paramName = def.paramNames[k]
    if (paramName) {
      params[paramName] = v ? v.toLowerCase() : '0x'
    }
  })
  return params
}

module.exports = decodeExecuteCallData
