const recoverSigner = require('./recoverSigner')
const typedDataEIP712 = require('./typedDataEIP712')
const proxyAccountFromOwner = require('./proxyAccountFromOwner')
const { toChecksumAddress, isAddress } = require('web3-utils')

const metaDelegateCallParamTypes = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes', calldata: true},
]

const verifySignedMessage = (signedMessage) => {
  const { accountAddress, signature, message, signer, EIP712TypedData, functionName } = signedMessage

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

  const recoveredSigner = recoverSigner({ signature, typedDataHash: message})
  if (recoveredSigner !== signer) {
    throw new Error(`Provided Signer ${signer} does not match Signer ${recoveredSigner} in Signed Message`)
  }

  const computedAccountAddress = accountFromOwner(signer)
  if (toChecksumAddress(computedAccountAddress) !== toChecksumAddress(accountAddress)) {
    throw new Error(`Account Address ${accountAddress} does not match Computed Address ${computedAccountAddress}`)
  }

  const signedParams = signedMessage.signedParams
  if (!signedParams) {
    throw new Error('signedParams not provided in signedMessage')
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
}

const accountFromOwner = (ownerAddress) => {
  if (!isAddress(ownerAddress)) {
    throw new Error(`accountFromOwner() Error: ${ownerAddress} is not a valid address`)
  }
  return proxyAccountFromOwner(ownerAddress)
}


module.exports = verifySignedMessage
