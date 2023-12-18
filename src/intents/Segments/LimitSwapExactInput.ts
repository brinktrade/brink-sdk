import { TokenArgs, SegmentParamType, BigIntish, PriceCurveJSON, FillStateParamsArgs } from '@brinkninja/types'
import { FillStateParams } from '..'
import { priceCurveType } from '../../internal'
import Token from '../Token'
import TokenSegment from './TokenSegment'
import limitSwapExactInput_getOutput from '../../swaps/limitSwapExactInput_getOutput'

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

export default class LimitSwapExactInput extends TokenSegment {
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
      tokenParams: [
        {
          tokenParam: 'tokenIn',
          getTokenAmount: async (): Promise<string> => tokenInAmount?.toString(),
          isInput: true
        },
        {
          tokenParam: 'tokenOut',
          getTokenAmount: async (): Promise<string | undefined> => {
            let amt
            try {
              const amtBN = await limitSwapExactInput_getOutput({
                filledInput: 0,
                totalInput: BigInt(tokenInAmount),
                input: BigInt(tokenInAmount),
                priceCurve: priceCurveType(priceCurve.address),
                priceCurveParams: priceCurve.params
              })
              amt = amtBN.toString()
            } catch (err) {
              return
            }
            return amt
          },
          isInput: false
        },
      ]
    })
  }
}
