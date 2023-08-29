import { TokenArgs, PrimitiveParamType, BigIntish } from '@brinkninja/types'
import Token from '../Token'
import InputTokenPrimitive from './InputTokenPrimitive'

export type LimitSwapExactInputArgs = {
  priceCurveAddress: string
  priceCurveParams: string
  signer: string
  tokenIn: TokenArgs
  tokenOut: TokenArgs
  tokenInAmount: BigIntish,
  fillStateParams: FillStateParamsJSON
}

export type FillStateParamsJSON = {
  id: BigIntish
  startX96: BigIntish
  sign: boolean
}

export const LimitSwapExactInputFunctionParams: PrimitiveParamType[] = [
  {
    name: 'priceCurveAddress',
    type: 'address',
    signed: true
  },
  {
    name: 'priceCurveParams',
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
    name: 'fillStateId',
    type: 'uint64',
    signed: true
  },
  {
    name: 'fillStateStartX96',
    type: 'uint128',
    signed: true
  },
  {
    name: 'fillStateSign',
    type: 'boolean',
    signed: true
  },
  {
    name: 'data',
    type: 'UnsignedMarketSwapData',
    signed: false
  }
]

export default class LimitSwapExactInput extends InputTokenPrimitive {
  public constructor ({
    priceCurveAddress,
    priceCurveParams,
    signer,
    tokenIn,
    tokenOut,
    tokenInAmount,
    fillStateParams
  }: LimitSwapExactInputArgs) {
    super({
      functionName: 'limitSwapExactInput',
      type: 'swap',
      requiresUnsignedCall: true,
      paramsJSON: {
        priceCurve: {
          address: priceCurveAddress,
          params: priceCurveParams
        },
        signer,
        tokenIn: (new Token(tokenIn)).toJSON(),
        tokenOut: (new Token(tokenOut)).toJSON(),
        tokenInAmount: tokenInAmount?.toString(),
        fillStateParams
      },
      paramTypes: LimitSwapExactInputFunctionParams,
      paramValues: [
        priceCurveAddress,
        priceCurveParams,
        signer,
        (new Token(tokenIn)).toStruct(),
        (new Token(tokenOut)).toStruct(),
        tokenInAmount,
        fillStateParams.id,
        fillStateParams.startX96,
        fillStateParams.sign
      ],
      inputTokenParam: 'tokenIn',
      inputAmountParam: 'tokenInAmount'
    })
  }
}
