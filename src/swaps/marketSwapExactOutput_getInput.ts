import { utils } from 'ethers'
import evm from '../internal/EthereumJsVm'

const { defaultAbiCoder } = utils

export type marketSwapExactOutput_getInputArgs = {
  output: BigInt
  priceX96: BigInt
  feePercent: BigInt
  feeMin: BigInt
}

export type marketSwapExactOutput_getInputResult = {
  input: BigInt
  fee: BigInt
  inputWithFee: BigInt
}

export default async function marketSwapExactOutput_getInput ({
  output,
  priceX96,
  feePercent,
  feeMin
}: marketSwapExactOutput_getInputArgs): Promise<marketSwapExactOutput_getInputResult> {
  const result = await evm.callContractFn(
    evm.SwapIO,
    'marketSwapExactOutput_getInput',
    output,
    priceX96,
    feePercent,
    feeMin
  )
  const returnValues = defaultAbiCoder.decode(['uint256','uint256','uint256'], `0x${result}`)
  return {
    input: BigInt(returnValues[0]),
    fee: BigInt(returnValues[1]),
    inputWithFee: BigInt(returnValues[2]),
  }
}
