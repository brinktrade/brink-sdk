import { utils } from 'ethers'
import evm from '../internal/EthereumJsVm'

const { defaultAbiCoder } = utils

export default async function marketSwapExactOutput_getInput (
  output: BigInt,
  priceX96: BigInt,
  feePercent: BigInt,
  feeMin: BigInt
): Promise<{
  input: BigInt,
  fee: BigInt,
  inputWithFee: BigInt
}> {
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
