import { TokenArgs, PrimitiveParamType, BigIntish, PriceCurveJSON, FillStateParamsArgs } from '@brinkninja/types'
import { FillStateParams } from '..'
import Token from '../Token'
import InputTokenPrimitive from './InputTokenPrimitive'

export type LimitSwapExactInputArgs = {
  priceCurve: PriceCurveJSON
  signer: string
  tokenIn: TokenArgs
  tokenOut: TokenArgs
  tokenInAmount: BigIntish,
  fillStateParams: FillStateParamsArgs
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
  { name: 'fillStateParams', 
    type: 'FillStateParams', 
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
        priceCurve.address,
        priceCurve.params,
        signer,
        (new Token(tokenIn)).toStruct(),
        (new Token(tokenOut)).toStruct(),
        tokenInAmount,
        (new FillStateParams(fillStateParams)).toStruct()
      ],
      inputTokenParam: 'tokenIn',
      inputAmountParam: 'tokenInAmount'
    })
  }
}
