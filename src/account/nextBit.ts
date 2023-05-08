import { ethers } from 'ethers'
import loadBitmap from './loadBitmap'
import { bigIntToBinaryString } from '../utils'
import accountDeployed from './accountDeployed'

export type NextBitArgs = {
  account: string
  provider?: ethers.providers.Provider
  bitmaps?: Record<number, string>
}

async function nextBit ({
  account,
  provider,
  bitmaps
}: NextBitArgs): Promise<{ bitmapIndex: BigInt, bit: BigInt }> {
  let bitmapIndex = BigInt(0)
  let bit = BigInt(1)
  if (!provider || await accountDeployed(account, provider)) {
    let curBitmap: string, curBitmapBinStr: string
    let curBitmapIndex: number = -1
    let nextBitIndex: number = -1
    while(nextBitIndex < 0) {
      curBitmapIndex++
      if (provider) {
        throw new Error('NOT IMPLEMENTED')
        // curBitmap = await loadBitmap(account, provider, BigInt(curBitmapIndex))
      } else {
        if (!bitmaps) {
          throw new Error(`bitmaps not provided`)
        }
        if (!bitmaps[curBitmapIndex]) {
          throw new Error(`bitmap at index ${curBitmapIndex} not provided`)
        }
        curBitmap = bitmaps[curBitmapIndex]
      }
      curBitmapBinStr = bigIntToBinaryString(BigInt(curBitmap))
      for (let i = 0; i < curBitmapBinStr.length; i++) {
        if (curBitmapBinStr.charAt(i) == '0') {
          nextBitIndex = i
          break
        }
      }
    }
    bitmapIndex = BigInt(curBitmapIndex)
    bit = BigInt(2)**BigInt(nextBitIndex)
  }
  return { bitmapIndex, bit }
}

export default nextBit
