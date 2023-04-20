import { ethers } from 'ethers'
import { readUint256Oracle } from '../../oracles'

const checkRequireUint256LowerBound = async (provider: ethers.providers.Provider, oracle: string, params: string, lowerBound: BigInt): Promise<Boolean>  => {
  const oraclePrice = await readUint256Oracle(provider, oracle, params)
  if (oraclePrice < lowerBound) {
    return true
  }
  return false
}
export default checkRequireUint256LowerBound