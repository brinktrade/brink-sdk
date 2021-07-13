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

  tokenTypes: {
    ETH: 'ETH',
    TOKEN: 'TOKEN',
  },


  // add the rest of the new param types

  metaDelegateCallSignedParamTypes: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes', calldata: true }
  ],

  metaPartialSignedDelegateCallSignedParamTypes: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes', calldata: true }
  ],




  // TODO: remove these

  executeCallParamTypes: [
    { name: 'value', type: 'uint256' },
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' }
  ],
  
  executeCallWithoutValueParamTypes: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' }
  ],
  
  executeCallWIthoutDataParamTypes: [
    { name: 'value', type: 'uint256' },
    { name: 'to', type: 'address' }
  ],
  
  executeDelegateCallParamTypes: [
    { name: 'to', type: 'address' },
    { name: 'data', type: 'bytes' }
  ],

  tokenToTokenSwapParamTypes: [
    { name: 'tokenIn', type: 'address' },
    { name: 'tokenOut', type: 'address' },
    { name: 'tokenInAmount', type: 'uint256' },
    { name: 'tokenOutAmount', type: 'uint256' },
    { name: 'expiryBlock', type: 'uint256' }
  ],
  
  ethToTokenSwapParamTypes: [
    { name: 'token', type: 'address' },
    { name: 'ethAmount', type: 'uint256' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'expiryBlock', type: 'uint256' }
  ],
  
  tokenToEthSwapParamTypes: [
    { name: 'token', type: 'address' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'ethAmount', type: 'uint256' },
    { name: 'expiryBlock', type: 'uint256' }
  ],

  adapterTokenToTokenParamTypes: [
    { name: 'tokenIn', type: 'address' },
    { name: 'tokenOut', type: 'address' },
    { name: 'tokenInAmount', type: 'uint256' },
    { name: 'tokenOutAmount', type: 'uint256' },
    { name: 'account', type: 'address' }
  ],

  adapterEthToTokenParamTypes: [
    { name: 'token', type: 'address' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'account', type: 'address' }
  ],

  adapterTokenToEthParamTypes: [
    { name: 'token', type: 'address' },
    { name: 'tokenAmount', type: 'uint256' },
    { name: 'ethAmount', type: 'uint256' },
    { name: 'account', type: 'address' }
  ],

  cancelParamTypes: [],

  recoveryCancelParamTypes: []
}
