const recoverSigner = require('./recoverSigner')
const proxyAccountFromOwner = require('./proxyAccountFromOwner')
const { toChecksumAddress, isAddress } = require('web3-utils')

const ethToTokenParamTypes = [
  { name: 'bitmapIndex', type: 'uint256' },
  { name: 'bit', type: 'uint256'},
  { name: 'token', type: 'address'},
  { name: 'ethAmount', type: 'uint256'},
  { name: 'tokenAmount', type: 'uint256'},
  { name: 'expiryBlock', type: 'uint256'},
  { name: 'to', type: 'address'},
  { name: 'data', type: 'bytes'}
]

const tokenToEthParamTypes = [
  { name: 'bitmapIndex', type: 'uint256' },
  { name: 'bit', type: 'uint256'},
  { name: 'token', type: 'address'},
  { name: 'tokenAmount', type: 'uint256'},
  { name: 'ethAmount', type: 'uint256'},
  { name: 'expiryBlock', type: 'uint256'},
  { name: 'to', type: 'address'},
  { name: 'data', type: 'bytes'}
]

const tokenToTokenParamTypes = [
  { name: 'bitmapIndex', type: 'uint256' },
  { name: 'bit', type: 'uint256'},
  { name: 'tokenIn', type: 'address'},
  { name: 'tokenOut', type: 'address'},
  { name: 'tokenInAmount', type: 'uint256'},
  { name: 'tokenOutAmount', type: 'uint256'},
  { name: 'expiryBlock', type: 'uint256'},
  { name: 'to', type: 'address'},
  { name: 'data', type: 'bytes'}
]

const verifySignedMessage = (signedMessage) => {
  const { accountAddress, signature, message, signer } = signedMessage

  if (!accountAddress) {
    throw new Error('verifySignedMessage Error: Account Address not provided in signedMessage')
  }

  if (!signature) {
    throw new Error('verifySignedMessage Error: Signature not provided in signedMessage')
  }

  if (!message) {
    throw new Error('verifySignedMessage Error: Message not provided in signedMessage')
  }

  if (!signer) {
    throw new Error('verifySignedMessage Error: Signer not provided in signedMessage')
  }

  const recoveredSigner = recoverSigner({ signature, typedDataHash: message})
  if (recoveredSigner !== signer) {
    throw new Error(`verifySignedMessage Error: Provided Signer ${signer} does not match Signer ${recoveredSigner} in Signed Message`)
  }

  const computedAccountAddress = accountFromOwner(signer)
  if (toChecksumAddress(computedAccountAddress) !== toChecksumAddress(accountAddress)) {
    throw new Error(`verifySignedMessage Error: Account Address ${accountAddress} does not match Computed Address ${computedAccountAddress}`)
  }

  const signedParams = signedMessage.signedParams
  if (!signedParams || !signedParams[1]) {
    throw new Error('verifySignedMessage Error: signedParams not provided in signedMessage')
  }

  const callData = signedMessage.signedParams[1].callData
  if (!callData) {
    throw new Error('verifySignedMessage Error: callData not provided in signedParams')
  }

  const functionName = callData.functionName
  const params = callData.params
  if (!functionName) {
    throw new Error(`verifySignedMessage Error: No functionName specified in callData`)
  }
  if (!params) {
    throw new Error(`verifySignedMessage Error: No params specified in callData`)
  }
  switch(functionName) {
    case 'ethToToken':
      verifyParams(params, ethToTokenParamTypes)
      break
    case 'tokenToEth':
      verifyParams(params, tokenToEthParamTypes)
      break
    case 'tokenToToken':
      verifyParams(params, tokenToTokenParamTypes)
      break
    default:
      throw new Error(`verifySignedMessage Error: functionName ${functionName} is not a valid functionName`)
  }
}

const verifyParams = (params, paramTypes) => {  
  for (let i=0; i<paramTypes.length; i++) {
    let validParam = false
    let validType= false
    for (let j=0; j<params.length; j++) {
      if (paramTypes[i].name === params[j].name) {
        validParam = true
        if (paramTypes[i].type === params[j].type) {
          validType = true
        }
        break
      }
    }
    if (!validParam) {
      throw new Error(`verifySignedMessage Error: Parameter ${paramTypes[i].name} is not defined`)
    } else if (!validType) {
      throw new Error(`verifySignedMessage Error: Parameter ${paramTypes[i].name} is of the incorrect type, should be ${paramTypes[i].type}`)
    }
  }
}

const accountFromOwner = (ownerAddress) => {
  if (!isAddress(ownerAddress)) {
    throw new Error(`accountFromOwner() Error: ${ownerAddress} is not a valid address`)
  }
  return proxyAccountFromOwner(ownerAddress)
}


module.exports = verifySignedMessage
