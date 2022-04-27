_ = require('lodash')
const verifySignedMessage = require('./verifySignedMessage')

function parseSignedMessage (signedMessage) {
  verifySignedMessage(signedMessage)

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

  msg = {
    ...msg,
    bitmapIndex: paramByName('bitmapIndex'),
    bit: paramByName('bit')
  }

  switch (msg.verifierFunctionName) {
    case 'ethToToken':
      msg = {
        ...msg,
        expiryBlock: paramByName('expiryBlock'),
        tokenIn: 'ETH',
        tokenInAmount: paramByName('ethAmount'),
        tokenOut: paramByName('token'),
        tokenOutAmount: paramByName('tokenAmount')
      }
    break
    case 'tokenToEth':
      msg = {
        ...msg,
        expiryBlock: paramByName('expiryBlock'),
        tokenIn: paramByName('token'),
        tokenInAmount: paramByName('tokenAmount'),
        tokenOut: 'ETH',
        tokenOutAmount: paramByName('ethAmount')
      }
    break
    case 'tokenToToken':
      msg = {
        ...msg,
        tokenIn: paramByName('tokenIn'),
        expiryBlock: paramByName('expiryBlock'),
        tokenInAmount: paramByName('tokenInAmount'),
        tokenOut: paramByName('tokenOut'),
        tokenOutAmount: paramByName('tokenOutAmount')
      }
    break
  }

  return msg
}

function paramByNameFn (params, name) {
  return _.find(params, { name }).value
}

module.exports = parseSignedMessage
