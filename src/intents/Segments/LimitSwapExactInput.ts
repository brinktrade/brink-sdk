import { TokenArgs, SegmentParamType, BigIntish, PriceCurveJSON, FillStateParamsArgs } from '@brinkninja/types'
import { FillStateParams } from '..'
import Token from '../Token'
import InputTokenSegment from './InputTokenSegment'

export type LimitSwapExactInputArgs = {
  priceCurve: PriceCurveJSON
  signer: string
  tokenIn: TokenArgs
  tokenOut: TokenArgs
  tokenInAmount: BigIntish,
  fillStateParams: FillStateParamsArgs
}

export const LimitSwapExactInputFunctionParams: SegmentParamType[] = [
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
    name: 'priceCurveAddress',
    type: 'address',
    signed: true
  },
  {
    name: 'priceCurveParams',
    type: 'bytes',
    signed: true
  },
  { name: 'fillStateParams', 
    type: 'FillStateParams', 
    signed: true 
  },
  {
    name: 'data',
    type: 'UnsignedLimitSwapData',
    signed: false
  }
]

export default class LimitSwapExactInput extends InputTokenSegment {
  public constructor ({
    priceCurve,
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
          address: priceCurve.address,
          params: priceCurve.params
        },
        signer,
        tokenIn: (new Token(tokenIn)).toJSON(),
        tokenOut: (new Token(tokenOut)).toJSON(),
        tokenInAmount: tokenInAmount?.toString(),
        fillStateParams: (new FillStateParams(fillStateParams)).toJSON()
      },
      paramTypes: LimitSwapExactInputFunctionParams,
      paramValues: [
        signer,
        (new Token(tokenIn)).toStruct(),
        (new Token(tokenOut)).toStruct(),
        tokenInAmount,
        priceCurve.address,
        priceCurve.params,
        (new FillStateParams(fillStateParams)).toStruct()
      ],
      inputTokenParam: 'tokenIn',
      inputAmountParam: 'tokenInAmount'
    })
  }
}