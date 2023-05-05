import { ethers } from 'ethers'
import accountDeployed from './accountDeployed'

async function storageLoad (account: string, provider: ethers.providers.Provider, ptr: string): Promise<string> {
  if (!await accountDeployed(account, provider)) {
    return '0x'
  } else {
    return await provider.getStorageAt(account, ptr)
  }
}

export default storageLoad
