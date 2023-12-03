import { TokenArgs, SegmentParamType } from '@brinkninja/types'
import Token from '../Token'
import Segment from './Segment'

export type Swap01Args = {
  signer: string
  tokenIn: TokenArgs
  tokenOut: TokenArgs
  inputAmountContract: string
  outputAmountContract: string
  inputAmountParams: string
  outputAmountParams: string
  solverValidator: string
}

export const Swap01FunctionParams: SegmentParamType[] = [
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
    name: 'inputAmountContract',
    type: 'address',
    signed: true
  },
  {
    name: 'outputAmountContract',
    type: 'address',
    signed: true
  },
  {
    name: 'inputAmountParams',
    type: 'bytes',
    signed: true
  },
  {
    name: 'inputAmountParams',
    type: 'bytes',
    signed: true
  },
  {
    name: 'solverValidator',
    type: 'address',
    signed: true
  },
  {
    name: 'data',
    type: 'UnsignedSwapData',
    signed: false
  }
]

export default class Swap01 extends Segment {
  public constructor ({
    signer,
    tokenIn,
    tokenOut,
    inputAmountContract,
    outputAmountContract,
    inputAmountParams,
    outputAmountParams,
    solverValidator
  }: Swap01Args) {
    super({
      functionName: 'swap01',
      type: 'swap',
      requiresUnsignedCall: true,
      paramsJSON: {
        signer,
        tokenIn: (new Token(tokenIn)).toJSON(),
        tokenOut: (new Token(tokenOut)).toJSON(),
        inputAmountContract: inputAmountContract.toString(),
        outputAmountContract: outputAmountContract.toString(),
        inputAmountParams: inputAmountParams.toString(),
        outputAmountParams: outputAmountParams.toString(),
        solverValidator: solverValidator.toString()
      },
      paramTypes: Swap01FunctionParams,
      paramValues: [
        signer,
        (new Token(tokenIn)).toStruct(),
        (new Token(tokenOut)).toStruct(),
        inputAmountContract.toString(),
        outputAmountContract.toString(),
        inputAmountParams.toString(),
        outputAmountParams.toString(),
        solverValidator.toString()
      ]
    })
  }
}
