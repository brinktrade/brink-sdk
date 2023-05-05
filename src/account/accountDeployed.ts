import { ethers } from 'ethers'

const accountDeployed = async (account: string, provider: ethers.providers.Provider) => {
  const code = await provider.getCode(account)
  return code !== '0x'
}

export default accountDeployed
