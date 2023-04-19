import { ethers } from 'ethers'

// if bit is used, return false, else return true
const checkRequireBlockNotMined = async (provider: ethers.providers.Provider, expirationBlock: BigInt): Promise<Boolean>  => {
  const blockNumber = await provider.getBlockNumber()
  if (expirationBlock < BigInt(blockNumber)) {
    return false
  }
  return true
}

export default checkRequireBlockNotMined