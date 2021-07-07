const { 
  verifyEncodeTransferEth,
  verifyEncodeTransferToken
} = require('./callVerifiers')
const encodeFunctionCall = require('./encodeFunctionCall')

const MAX_UINT_256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

class MessageEncoder {

  constructor () {}

  async encodeTransferEth(bitmapIndex, bit, recipientAddress, amount, expiryBlock=MAX_UINT_256) {
    const call = {
      functionName: 'ethTransfer',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'}
      ],
      params: [bitmapIndex, bit, recipientAddress, amount, expiryBlock.toString()]
    }
    const callEncoded = encodeFunctionCall(call)

    verifyEncodeTransferEth(amount, recipientAddress, callEncoded)
    return callEncoded
  }

  async encodeTransferToken(bitmapIndex, bit, tokenAddress, recipientAddress, amount, expiryBlock=MAX_UINT_256) {
    const call = {
      functionName: 'tokenTransfer',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'}
      ],
      params: [bitmapIndex, bit, tokenAddress, recipientAddress, amount, expiryBlock.toString()]
    }
    const callEncoded = encodeFunctionCall(call)

    verifyEncodeTransferToken(tokenAddress, recipientAddress, amount)
    return callEncoded
  }
}

module.exports = MessageEncoder