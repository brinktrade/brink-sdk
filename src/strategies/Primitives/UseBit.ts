import Primitive from './Primitive'

export type UseBitConstructorArgs = {
  bitmapIndex: BigInt
  bit: BigInt
}

export default class UseBit extends Primitive {
  public constructor ({
    bitmapIndex,
    bit
  }: UseBitConstructorArgs) {
    super({
      functionName: 'useBit',
      params: { bitmapIndex, bit }
    })
  }
}
