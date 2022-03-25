const recoverSigner = require('./recoverSigner')
const typedDataEIP712 = require('./typedDataEIP712')
const proxyAccountFromOwner = require('./proxyAccountFromOwner')
const { toChecksumAddress, isAddress } = require('web3-utils')
const encodeFunctionCall = require('./encodeFunctionCall')

const metaDelegateCallParamTypes = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes', calldata: true},
]

const verifySignedMessage = (signedMessage) => {
  const { accountAddress, signature, message, signer, EIP712TypedData, functionName, signedParams } = signedMessage

  if (!accountAddress) {
    throw new Error('Account Address not provided in signedMessage')
  }

  if (!signature) {
    throw new Error('Signature not provided in signedMessage')
  }

  if (!message) {
    throw new Error('Message not provided in signedMessage')
  }

  if (!signer) {
    throw new Error('Signer not provided in signedMessage')
  }

  if (!functionName) {
    throw new Error(`No functionName specified in signedMessage`)
  }

  if (functionName !== 'metaDelegateCall') {
    throw new Error(`Unsupported functionName \'${functionName}\', only \'metaDelegateCall\' supported`)
  }

  if (!signedParams || signedParams.length === 0 || !signedParams[1]) {
    throw new Error('signedParams not provided in signedMessage')
  }

  if (!EIP712TypedData) {
    throw new Error('EIP712TypedData not provided in signedMessage')
  }

  const callData = signedParams[1].callData
  if (!callData) {
    throw new Error('CallData not provided in signedMessage Params')
  }

  const recoveredSigner = recoverSigner({ signature, typedDataHash: message})
  if (toChecksumAddress(recoveredSigner) !== toChecksumAddress(signer)) {
    throw new Error(`Provided Signer ${signer} does not match Signer ${recoveredSigner} in Signed Message`)
  }

  const computedAccountAddress = accountFromOwner(signer)
  if (toChecksumAddress(computedAccountAddress) !== toChecksumAddress(accountAddress)) {
    throw new Error(`Account Address ${accountAddress} does not match Computed Address ${computedAccountAddress}`)
  }

  const paramValues = signedParams.map(p => p.value)
  const { typedDataHash } = typedDataEIP712({ 
    accountVersion: EIP712TypedData.domain.version, 
    chainId: EIP712TypedData.domain.chainId,
    accountAddress,
    functionName,
    paramTypes: metaDelegateCallParamTypes,
    params: paramValues
  })

  if (typedDataHash !== message) {
    throw new Error(`Provided signed message hash ${message} does not match recovered hash ${typedDataHash}`)
  }

  const eip712To = EIP712TypedData.value.to
  const eip712Data = EIP712TypedData.value.data
  let toValueExists = false
  let dataValueExists = false
  for (let i=0; i<paramValues.length; i++) {
    if (isAddress(paramValues[i])) {
      if (toChecksumAddress(paramValues[i]) === toChecksumAddress(eip712To)) {
        toValueExists = true
      }
    }
    if (paramValues[i] === eip712Data) {
      dataValueExists = true
    }
  }

  if (!toValueExists || !dataValueExists) {
    throw new Error(`Signed message params do not match EIP712TypedData params`)
  }


  const callDataFunctionName = callData.functionName
  if (!callDataFunctionName) {
    throw new Error('Function name not provided in calldata')
  }
  const callDataParams = callData.params
  if (!callDataParams) {
    throw new Error('Params not provided in calldata')
  }

  const callDataParamTypes = callDataParams.map(p => p.type)
  const callDataParamNames = callDataParams.map(p => p.name)

  if (!callDataParamTypes) {
    throw new Error('Param Types not provided in calldata')
  }

  if (!callDataParamNames) {
    throw new Error('Param Names not provided in calldata')
  }

  let callDataParamNameTypes = []
  for (let i=0; i< callDataParamTypes.length; i++) {
    const callDataParamNameType = {name: callDataParamNames[i], type: callDataParamTypes[i]}
    callDataParamNameTypes.push(callDataParamNameType)
  }
  const callDataParamValues = callDataParams.map(p => p.value)
  let callDataParamValuesNoUndefined = []
  for (let i=0; i<callDataParamValues.length; i++) {
    if (callDataParamValues[i]) {
      callDataParamValuesNoUndefined.push(callDataParamValues[i])
    }
  }

  if (!callDataParamValues) {
    throw new Error('Param values not provided in calldata')
  }

  const encodedFunctionCall = encodeFunctionCall({ functionName: callDataFunctionName, paramTypes: callDataParamNameTypes, params: callDataParamValuesNoUndefined })
  if (encodedFunctionCall !== signedMessage.signedParams[1].value) {
    throw new Error('Encoded bytes value does not match encoded call data params')
  }
}

const accountFromOwner = (ownerAddress) => {
  if (!isAddress(ownerAddress)) {
    throw new Error(`accountFromOwner() Error: ${ownerAddress} is not a valid address`)
  }
  return proxyAccountFromOwner(ownerAddress)
}


module.exports = verifySignedMessage
