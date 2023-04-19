import { ethers } from 'ethers'
const isDeployed = async (address: string, provider: ethers.providers.Provider) => {
  const code = await provider.getCode(address)
  return code !== '0x'
}

export default isDeployed