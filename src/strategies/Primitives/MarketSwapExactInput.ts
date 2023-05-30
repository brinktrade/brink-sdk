import { TokenArgs, OracleJSON, PrimitiveParamType, BigIntish } from '@brinkninja/types'
import Token from '../Token'
import InputTokenPrimitive from './InputTokenPrimitive'

export type MarketSwapExactInputArgs = {
  oracle: OracleJSON,
  signer: string
  tokenIn: TokenArgs
  tokenOut: TokenArgs
  tokenInAmount: BigIntish
  feePercent: BigIntish
  feeMin: BigIntish
}

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

export default class MarketSwapExactInput extends InputTokenPrimitive {
  public constructor ({
    oracle,
    signer,
    tokenIn,
    tokenOut,
    tokenInAmount,
    feePercent,
    feeMin
  }: MarketSwapExactInputArgs) {
    super({
      functionName: 'marketSwapExactInput',
      type: 'swap',
      requiresUnsignedCall: true,
      paramsJSON: {
        oracle: {
          address: oracle.address,
          params: oracle.params
        },
        signer,
        tokenIn: (new Token(tokenIn)).toJSON(),
        tokenOut: (new Token(tokenOut)).toJSON(),
        tokenInAmount: tokenInAmount.toString(),
        feePercent: feePercent.toString(),
        feeMin: feeMin.toString()
      },
      paramTypes: MarketSwapExactInputFunctionParams,
      paramValues: [
        oracle.address,
        oracle.params,
        signer,
        (new Token(tokenIn)).toStruct(),
        (new Token(tokenOut)).toStruct(),
        tokenInAmount,
        feePercent,
        feeMin
      ],
      inputTokenParam: 'tokenIn',
      inputAmountParam: 'tokenInAmount'
    })
  }
}
