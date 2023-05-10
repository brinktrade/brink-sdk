import { PrimitiveParamType } from '../../Types'

export const MarketSwapExactInputFunctionParams: PrimitiveParamType[] = [
  {
    name: 'priceOracle',
    type: 'address',
    signed: true
  },
  {
    name: 'priceOracleParams',
    type: 'bytes',
    signed: true
  },
  {
    name: 'owner',
    type: 'address',
    signed: true
  },
  {
    name: 'tokenIn',
    type: 'Token',
    signed: true
  },
  {
    name: 'tokenOut',
    type: 'Token',
    signed: true
  },
  {
    name: 'tokenInAmount',
    type: 'uint256',
    signed: true
  },
  {
    name: 'feePercent',
    type: 'uint24',
    signed: true
  },
  {
    name: 'feeMinTokenOut',
    type: 'uint256',
    signed: true
  },
  {
    name: 'data',
    type: 'UnsignedMarketSwapData',
    signed: false
  }
]

export const RequireBlockNotMinedFunctionParams: PrimitiveParamType[] = [
  {
    name: 'blockNumber',
    type: 'uint256',
    signed: true
  }
]

export const RequireUint256LowerBoundFunctionParams: PrimitiveParamType[] = [
  {
    name: 'uint256Oracle',
    type: 'address',
    signed: true
  },
  {
    name: 'params',
    type: 'bytes',
    signed: true
  },
  {
    name: 'lowerBound',
    type: 'uint256',
    signed: true
  }
]

export const UseBitFunctionParams: PrimitiveParamType[] = [
  {
    name: 'bitmapIndex',
    type: 'uint256',
    signed: true
  },
  {
    name: 'bit',
    type: 'uint256',
    signed: true
  }
]
