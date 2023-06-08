import { BigIntish, PriceCurveType } from '@brinkninja/types'
import { EthereumJsVm as evm, priceCurveAddress } from '../internal'

export type LimitSwapExactOutput_GetInputArgs = {
	output: BigIntish
  filledOutput: BigIntish
  totalOutput: BigIntish
  priceCurve: PriceCurveType
	priceCurveParams: string
}

export default async function limitSwapExactInput_getOutput ({
	output,
  filledOutput,
  totalOutput,
  priceCurve,
	priceCurveParams,
}: LimitSwapExactOutput_GetInputArgs): Promise<bigint> {
  if (BigInt(filledOutput) > BigInt(totalOutput)) {
    throw new Error(`filledOutput cannot be greater than totalOutput`)
  }

  const unfilledOutput = BigInt(totalOutput) - BigInt(filledOutput)
  const tooMuchOutputErr = BigInt(output) > unfilledOutput

  let result
  try {
    result = await evm.callContractFn(
      evm.SwapIO,
      'limitSwapExactInput_getOutput',
      BigInt(output),
      BigInt(filledOutput),
      BigInt(totalOutput),
      priceCurveAddress(priceCurve),
      priceCurveParams
    )
  } catch (err: any) {
    if (tooMuchOutputErr) {
      throw new Error(`output ${output.toString()} is more than unfilled output ${unfilledOutput.toString()}`)
    } else {
      throw new Error(`limitSwapExactInput_getOutput reverted: ${err.message}`)
    }
  }
  return BigInt(`0x${result}`)
}
