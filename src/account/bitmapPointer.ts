import { soliditySha3 } from 'web3-utils'

const bitmapPointer = (bitmapIndex: BigInt): string => {
  return `0x${(
    BigInt(soliditySha3('bmp') as string) + BigInt(bitmapIndex.toString())
  ).toString(16)}`
}

export default bitmapPointer
