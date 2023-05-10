import Primitive from './Primitive'
import { BigIntish } from '../../Types'

export type UseBitConstructorArgs = {
  bitmapIndex: BigIntish
  bit: BigIntish
}

export default class UseBit extends Primitive {
  public constructor ({
    bitmapIndex,
    bit
  }: UseBitConstructorArgs) {
    super({
      functionName: 'useBit',
      params: {
        bitmapIndex: BigInt(bitmapIndex),
        bit: BigInt(bit)
      }
    })
  }
}
