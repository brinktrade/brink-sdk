_ = require('lodash')
const { VERIFIERS } = require('@brinkninja/config').mainnet


module.exports = (opts = {}) => {
  const parseSignedMessage = (signedMessage, parseSignedMessageOpts = {}) => {
    const customVerifiers = parseSignedMessageOpts.verifiers || opts.verifiers || []
    const verifiers = [...VERIFIERS, ...customVerifiers]

    const { message, signature, signer, accountAddress, functionName, signedParams } = signedMessage
    const { callData } = signedParams[1]
    const { params } = callData

    let msg = {
      message, signature, signer, accountAddress, functionName
    }

    msg.verifier = signedParams[0].value
    msg.verifierCallData = signedParams[1].value
    msg.verifierFunctionName = callData.functionName

    const paramByName = paramByNameFn.bind(this, params)

    const verifierDef = verifiers.find(({contractAddress, functionName }) => contractAddress.toLowerCase() === msg.verifier.toLowerCase() && functionName.toLowerCase() === msg.verifierFunctionName.toLowerCase())
    if (!verifierDef) {
      throw new Error(`Either ${msg.verifier} is not a supported verifier address or ${msg.verifierFunctionName} is not a supported function`)
    }
    verifierDef.paramTypes.forEach(pt => {
      if (pt.signed) {
        msg[pt.name] = paramByName(pt.name)
      }
    })

    return msg
  }
  return parseSignedMessage
}

function paramByNameFn (params, name) {
  return _.find(params, { name }).value
}
