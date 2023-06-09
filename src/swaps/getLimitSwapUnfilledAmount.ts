import { BigIntish } from '@brinkninja/types'
import { EthereumJsVm as evm } from '../internal'

export type GetLimitSwapUnfilledAmountArgs = {
	fillStateStartX96: BigIntish
	fillStateSign: boolean
	fillStateX96: BigIntish
	totalAmount: BigIntish
}

export default async function getLimitSwapUnfilledAmount ({
	fillStateStartX96,
	fillStateSign,
	fillStateX96,
	totalAmount
}: GetLimitSwapUnfilledAmountArgs): Promise<bigint> {
  let result
  try {
    result = await evm.callContractFn(
      'SwapIO',
      'getUnfilledAmount',
      {
        id: BigInt(0), // SwapIO call for getUnfilledAmount doesn't use id
        startX96: BigInt(fillStateStartX96),
        sign: fillStateSign,
      },
      BigInt(fillStateX96),
      BigInt(totalAmount)
    )
  } catch (err: any) {
    throw new Error(`getUnfilledAmount reverted: ${err.message}`)
  }
  return BigInt(`0x${result}`)
}
