import isDeployed from "./isDeployed"
import bitmapPointer from '../../utils/bitmapPointer'
import BigNumber from 'bignumber.js'
import { padLeft } from 'web3-utils'


// if bit is used, return false, else return true
const bitUsed = async (provider: any, accountAddress: String, bitmapIndex: BigInt, bit: BigInt) => {
  if (!await isDeployed(accountAddress, provider)) {
    return false
  }
  const bitmap = await provider.getStorageAt(accountAddress, bitmapPointer(bitmapIndex))
  const bmpBinStr = bnToBinaryString(bitmap)
  const bitBinStr = bnToBinaryString(new BigNumber(bit.toString()))

  if (bmpBinStr.length !== bitBinStr.length) {
    throw new Error(`binary string length mismatch`)
  }

  for (let i = 0; i < bmpBinStr.length; i++) {
    const bmpChar: any = bmpBinStr[i]
    const bitChar: any = bitBinStr[i]
    if (bmpChar == 1 && bitChar == 1) {
      return true
    }
  }
  return false

}

function bnToBinaryString (bn: BigNumber) {
  // using bignumber.js here for the base-2 support
  const bitmapBN = new BigNumber(bn.toString())
  const bitmapBinStr = padLeft(bitmapBN.toString(2), 256, '0').split("").reverse().join("")
  return bitmapBinStr
}

export default bitUsed