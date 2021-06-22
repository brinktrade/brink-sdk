module.exports = [
  {
    name: 'ethTransfer',
    paramTypes: [],
    paramNames: [],
    mapTo: 'recipientAddress',
    mapValue: 'amount',
    signature: null,
    encodedSignature: '0x'
  },
  {
    name: 'tokenTransfer',
    paramTypes: ['address','uint256'],
    paramNames: ['recipient','amount'],
    mapTo: 'tokenAddress',
    mapParams: {
      recipient: 'recipientAddress'
    },
    signature: 'transfer(address,uint256)',
    encodedSignature: '0xa9059cbb'
  }
]
