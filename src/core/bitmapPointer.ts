import { soliditySha3 } from 'web3-utils'
import { BigIntish } from '@brinkninja/types'

export type BitmapPointerArgs = {
  bitmapIndex: BigIntish
}

const bitmapPointer = ({
  bitmapIndex
}: BitmapPointerArgs): string => {
  return `0x${(
    BigInt(soliditySha3('bmp') as string) + BigInt(bitmapIndex)
  ).toString(16)}`
}

export default bitmapPointer
