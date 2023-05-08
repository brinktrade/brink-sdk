import { utils } from 'ethers'
import evm from '../internal/EthereumJsVm'

const { defaultAbiCoder } = utils

export default async function marketSwapExactInput_getOutput (
  input: BigInt,
  priceX96: BigInt,
  feePercent: BigInt,
  feeMin: BigInt
): Promise<{
  output: BigInt,
  fee: BigInt,
  outputWithFee: BigInt
}> {
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
