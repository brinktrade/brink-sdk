import { utils } from 'ethers'
import evm from '../internal/EthereumJsVm'

const { defaultAbiCoder } = utils

export type marketSwapExactInput_getOutputArgs = {
  input: BigInt
  priceX96: BigInt
  feePercent: BigInt
  feeMin: BigInt
}

export type marketSwapExactInput_getOutputResult = {
  output: BigInt
  fee: BigInt
  outputWithFee: BigInt
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
    input,
    priceX96,
    feePercent,
    feeMin
  )
  const returnValues = defaultAbiCoder.decode(['uint256','uint256','uint256'], `0x${result}`)
  return {
    output: BigInt(returnValues[0]),
    fee: BigInt(returnValues[1]),
    outputWithFee: BigInt(returnValues[2]),
  }
}
