module.exports = {
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  ZERO_BYTES32: '0x0000000000000000000000000000000000000000000000000000000000000000',

  swapFunctionNames: {
    tokenToTokenSwap: 'tokenToTokenSwap',
    ethToTokenSwap: 'ethToTokenSwap',
    tokenToEthSwap: 'tokenToEthSwap'
  },

  swapTypes: {
    TOKEN_TO_TOKEN: 'TOKEN_TO_TOKEN',
    ETH_TO_TOKEN: 'ETH_TO_TOKEN',
    TOKEN_TO_ETH: 'TOKEN_TO_ETH',
  },

  transferTypes: {
    ETH: 'ETH',
    TOKEN: 'TOKEN'
  },

  tokenTypes: ['ERC20', 'ERC721', 'ERC1155'],
  
  metaDelegateCallSignedParamTypes: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes', calldata: true }
  ],

  metaDelegateCall_EIP1271SignedParamTypes: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes', calldata: true }
  ]
}
