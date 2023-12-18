import { TokenArgs, SegmentParamType, SwapAmountArgs } from '@brinkninja/types'
import Token from '../Token'
import TokenSegment from './TokenSegment'
import { SwapAmount } from '../SwapAmount'

export type Swap01Args = {
  signer: string
  tokenIn: TokenArgs
  tokenOut: TokenArgs
  inputAmount: SwapAmountArgs
  outputAmount: SwapAmountArgs
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

export default class Swap01 extends TokenSegment {
  public constructor ({
    signer,
    tokenIn,
    tokenOut,
    inputAmount,
    outputAmount,
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
        inputAmount: (new SwapAmount(inputAmount)).toJSON(),
        outputAmount: (new SwapAmount(outputAmount)).toJSON(),
        solverValidator: solverValidator.toString()
      },
      paramTypes: Swap01FunctionParams,
      paramValues: [
        signer,
        (new Token(tokenIn)).toStruct(),
        (new Token(tokenOut)).toStruct(),
        (new SwapAmount(inputAmount)).contractAddress,
        (new SwapAmount(outputAmount)).contractAddress,
        (new SwapAmount(inputAmount)).paramsBytesData,
        (new SwapAmount(outputAmount)).paramsBytesData,
        solverValidator.toString()
      ],
      tokenParams: [
        {
          tokenParam: 'tokenIn',
          getTokenAmount: async (): Promise<string | undefined> => tokenAmountFromSwapAmountArgs(inputAmount),
          isInput: true
        },
        {
          tokenParam: 'tokenOut',
          getTokenAmount: async (): Promise<string | undefined> => tokenAmountFromSwapAmountArgs(outputAmount),
          isInput: false
        },
      ]
    })
  }
}

function tokenAmountFromSwapAmountArgs (swapAmountArgs: SwapAmountArgs): string | undefined {
  const swapAmount = new SwapAmount(swapAmountArgs)
  if (swapAmount.contractName == 'FixedSwapAmount01') {
    return (swapAmount.params[0] as bigint).toString()
  }
  return
}
