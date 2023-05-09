import { soliditySha3 } from 'web3-utils'

export type BitmapPointerArgs = {
  bitmapIndex: BigInt
}

const bitmapPointer = ({
  bitmapIndex
}: BitmapPointerArgs): string => {
  return `0x${(
    BigInt(soliditySha3('bmp') as string) + BigInt(bitmapIndex.toString())
  ).toString(16)}`
}

export default bitmapPointer
