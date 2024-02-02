import { BigIntish } from '@brinkninja/types'
import { EthereumJsVm as evm } from '../internal'

export type GetLimitSwapFilledAmountArgs = {
	fillStateStartX96: BigIntish
	fillStateSign: boolean
	fillStateX96: BigIntish
	totalAmount: BigIntish
}

export default async function getLimitSwapFilledAmount ({
	fillStateStartX96,
	fillStateSign,
	fillStateX96,
	totalAmount
}: GetLimitSwapFilledAmountArgs): Promise<bigint> {
  let result
  try {
    result = await evm.callContractFn(
      'SwapIO',
      'getFilledAmount',
      {
        id: BigInt(0), // SwapIO call for getFilledAmount doesn't use id
        startX96: BigInt(fillStateStartX96),
        sign: fillStateSign,
      },
      BigInt(fillStateX96),
      BigInt(totalAmount)
    )
  } catch (err: any) {
    throw new Error(`getFilledAmount reverted: ${err.message}`)
  }
  return BigInt(result)
}
