import { utils } from 'ethers'
import { EthereumJsVm as evm, X96 } from '../internal'
import { BigIntish } from '@brinkninja/types'

const { defaultAbiCoder } = utils

export type marketSwapExactInput_getOutputArgs = {
  input: BigIntish
  priceX96: BigIntish
  feePercent: BigIntish
  feeMin: BigIntish
}

export type marketSwapExactInput_getOutputResult = {
  output: bigint
  fee: bigint
  outputWithFee: bigint
}

export default async function marketSwapExactInput_getOutput ({
  input,
  priceX96,
  feePercent,
  feeMin
}: marketSwapExactInput_getOutputArgs): Promise<marketSwapExactInput_getOutputResult> {
  const estOutput = BigInt(input) * BigInt(priceX96) / X96
  const feeMinErr = estOutput < BigInt(feeMin)

  let result
  try {
    result = await evm.callContractFn(
      'SwapIO',
      'marketSwapExactInput_getOutput',
      BigInt(input),
      BigInt(priceX96),
      BigInt(feePercent),
      BigInt(feeMin)
    )
  } catch (err: any) {
    if (feeMinErr) {
      throw new Error(`feeMin is higher than output`)
    } else {
      throw new Error(`marketSwapExactInput_getOutput reverted: ${err.message}`)
    }
  }

  const returnValues = defaultAbiCoder.decode(['uint256','uint256','uint256'], `0x${result}`)
  return {
    output: BigInt(returnValues[0]),
    fee: BigInt(returnValues[1]),
    outputWithFee: BigInt(returnValues[2]),
  }
}
