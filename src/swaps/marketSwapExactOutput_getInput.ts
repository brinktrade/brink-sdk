import { ethers } from 'ethers'
import evm from '../internal/EthereumJsVm'
import { BigIntish } from '@brinkninja/types'

const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder()

export type marketSwapExactOutput_getInputArgs = {
  output: BigIntish
  priceX96: BigIntish
  feePercent: BigIntish
  feeMin: BigIntish
}

export type marketSwapExactOutput_getInputResult = {
  input: bigint
  fee: bigint
  inputWithFee: bigint
}

export default async function marketSwapExactOutput_getInput ({
  output,
  priceX96,
  feePercent,
  feeMin
}: marketSwapExactOutput_getInputArgs): Promise<marketSwapExactOutput_getInputResult> {
  const result = await evm.callContractFn(
    'SwapIO',
    'marketSwapExactOutput_getInput',
    BigInt(output),
    BigInt(priceX96),
    BigInt(feePercent),
    BigInt(feeMin)
  )
  const returnValues = defaultAbiCoder.decode(['uint256','uint256','uint256'], result)
  return {
    input: BigInt(returnValues[0]),
    fee: BigInt(returnValues[1]),
    inputWithFee: BigInt(returnValues[2]),
  }
}
