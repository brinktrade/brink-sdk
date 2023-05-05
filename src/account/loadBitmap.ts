import { ethers } from 'ethers'
import accountDeployed from './accountDeployed'
import bitmapPointer from './bitmapPointer'
import storageLoad from './storageLoad'


async function loadBitmap (account: string, provider: ethers.providers.Provider, bitmapIndex: BigInt): Promise<string> {
  if (await accountDeployed(account, provider)) {
    return await storageLoad(account, provider, bitmapPointer(bitmapIndex))
  } else {
    return '0x00'
  }
}

export default loadBitmap
