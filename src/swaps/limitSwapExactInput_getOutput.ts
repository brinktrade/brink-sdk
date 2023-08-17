import { BigIntish, PriceCurveType } from '@brinkninja/types'
import { EthereumJsVm as evm, priceCurveAddress } from '../internal'

export type LimitSwapExactInput_GetOutputArgs = {
	input: BigIntish
  filledInput: BigIntish
  totalInput: BigIntish
  priceCurve: PriceCurveType
	priceCurveParams: string
}

export default async function limitSwapExactInput_getOutput ({
	input,
  filledInput,
  totalInput,
  priceCurve,
	priceCurveParams,
}: LimitSwapExactInput_GetOutputArgs): Promise<bigint> {
  if (BigInt(filledInput) > BigInt(totalInput)) {
    throw new Error(`filledInput cannot be greater than totalInput`)
  }

  const unfilledInput = BigInt(totalInput) - BigInt(filledInput)
  const tooMuchInputErr = BigInt(input) > unfilledInput

  let result
  try {
    result = await evm.callContractFn(
      'SwapIO',
      'limitSwapExactInput_getOutput',
      BigInt(input),
      BigInt(filledInput),
      BigInt(totalInput),
      await priceCurveAddress(priceCurve),
      priceCurveParams
    )
  } catch (err: any) {
    if (tooMuchInputErr) {
      throw new Error(`input ${input.toString()} is more than unfilled input ${unfilledInput.toString()}`)
    } else {
      throw new Error(`limitSwapExactInput_getOutput reverted: ${err.message}`)
    }
  }
  return BigInt(`0x${result}`)
}
