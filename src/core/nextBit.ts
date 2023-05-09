import { bigIntToBinaryString } from '../internal'

export type NextBitArgs = {
  bitmaps: Record<number, string>
}

function nextBit ({
  bitmaps
}: NextBitArgs): { bitmapIndex: BigInt, bit: BigInt } {
  let bitmapIndex = BigInt(0)
  let bit = BigInt(1)

  if (!bitmaps[0]) {
    throw new Error(`at least 1 bitmap must be provided`)
  }

  let curBitmap: string, curBitmapBinStr: string
  let curBitmapIndex: number = -1
  let nextBitIndex: number = -1

  while(nextBitIndex < 0) {
    curBitmapIndex++
    if (!bitmaps[curBitmapIndex]) {
      throw new Error(`bitmap at index ${curBitmapIndex} not provided`)
    }
    curBitmap = bitmaps[curBitmapIndex]
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

  return { bitmapIndex, bit }
}

export default nextBit
