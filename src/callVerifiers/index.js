const { toBN: BN } = require('web3-utils')
const zeroNumberCheck = require('../utils/zeroNumberCheck')
const zeroAddressCheck = require('../utils/zeroAddressCheck')

const verifyBitData = (bitData) => {
  const { bitmapIndex, bit } = bitData
  const bitmapIndexBN = BN(bitmapIndex)
  const bitBN = BN(bit)

  // TODO: verify that bit is a power of 2

  if (!bitmapIndexBN.gte(BN(0))) {
    throw new Error(`Invalid bit data. bitmapIndex cannot be negative`)
  }

  if (!bitBN.gt(BN(0))) {
    throw new Error(`Invalid bit data. bit must be greater than 0`)
  }

  return { bitmapIndex, bit }
}

const verifyEncodeTransferEth = (value, to, data) => {
  zeroNumberCheck('value', value)
  zeroAddressCheck('to', to)

  if (data === '0x') {
    throw new Error(`Invalid "data" param. ${data} must not be empty bytes (0x)`)
  }
}

const verifyEncodeTransferToken = (tokenAddress, recipientAddress, amount) => {
  zeroAddressCheck('tokenAddress', tokenAddress)
  zeroAddressCheck('recipientAddress', recipientAddress)
  zeroNumberCheck('amount', amount)
}

const verifyTokenToTokenSwap = (tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock) => {
  zeroAddressCheck('tokenInAddress', tokenInAddress)
  zeroAddressCheck('tokenOutAddress', tokenOutAddress)
  zeroNumberCheck('tokenInAmount', tokenInAmount)
  zeroNumberCheck('tokenOutAmount', tokenOutAmount)
  zeroNumberCheck('expiryBlock', expiryBlock)
}

const verifyEthToTokenSwap = (tokenAddress, ethAmount, tokenAmount, expiryBlock) => {
  zeroAddressCheck('tokenAddress', tokenAddress)
  zeroNumberCheck('ethAmount', ethAmount)
  zeroNumberCheck('tokenAmount', tokenAmount)
  zeroNumberCheck('expiryBlock', expiryBlock)
}

const verifyTokenToEthSwap = (tokenAddress, tokenAmount, ethAmount, expiryBlock) => {
  zeroAddressCheck('tokenAddress', tokenAddress)
  zeroNumberCheck('tokenAmount', tokenAmount)
  zeroNumberCheck('ethAmount', ethAmount)
  zeroNumberCheck('expiryBlock', expiryBlock)
}

const verifyUpgrade = (implementationAddress) => {
  zeroAddressCheck('implementationAddress', implementationAddress)
}

const verifyAddProxyOwner = (newOwnerAddress) => {
  zeroAddressCheck('newOwnerAddress', newOwnerAddress)
}

const verifyRemoveProxyOwner = (newOwnerAddress) => {
  zeroAddressCheck('newOwnerAddress', newOwnerAddress)
}

module.exports = {
  verifyBitData,
  verifyEncodeTransferEth,
  verifyEncodeTransferToken,
  verifyTokenToTokenSwap,
  verifyEthToTokenSwap,
  verifyTokenToEthSwap,
  verifyUpgrade,
  verifyAddProxyOwner,
  verifyRemoveProxyOwner
}