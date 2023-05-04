export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000'

export const swapFunctionNames = {
  tokenToTokenSwap: 'tokenToTokenSwap',
  ethToTokenSwap: 'ethToTokenSwap',
  tokenToEthSwap: 'tokenToEthSwap'
}

export const swapTypes = {
  TOKEN_TO_TOKEN: 'TOKEN_TO_TOKEN',
  ETH_TO_TOKEN: 'ETH_TO_TOKEN',
  TOKEN_TO_ETH: 'TOKEN_TO_ETH',
}

export const transferTypes = {
  ETH: 'ETH',
  TOKEN: 'TOKEN'
}

export const tokenTypes = ['ERC20', 'ERC721', 'ERC1155']

export const MetaDelegateCallSignedParamTypes = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes', calldata: true }
]

export const MetaDelegateCall_EIP1271SignedParamTypes = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes', calldata: true }
]
