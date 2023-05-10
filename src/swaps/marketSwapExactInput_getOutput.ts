import { utils } from 'ethers'
import evm from '../internal/EthereumJsVm'
import { BigIntish } from '../Types'

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
  const result = await evm.callContractFn(
    evm.SwapIO,
    'marketSwapExactInput_getOutput',
    BigInt(input),
    BigInt(priceX96),
    BigInt(feePercent),
    BigInt(feeMin)
  )
  const returnValues = defaultAbiCoder.decode(['uint256','uint256','uint256'], `0x${result}`)
  return {
    output: BigInt(returnValues[0]),
    fee: BigInt(returnValues[1]),
    outputWithFee: BigInt(returnValues[2]),
  }
}
