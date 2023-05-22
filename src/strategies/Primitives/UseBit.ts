import { BigIntish, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'

export type UseBitArgs = {
  bitmapIndex: BigIntish
  bit: BigIntish
}

export const UseBitFunctionParams: PrimitiveParamType[] = [
  {
    name: 'bitmapIndex',
    type: 'uint256',
    signed: true
  },
  {
    name: 'bit',
    type: 'uint256',
    signed: true
  }
]

export default class UseBit extends Primitive {
  public constructor ({
    bitmapIndex,
    bit
  }: UseBitArgs) {
    super({
      functionName: 'useBit',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        bitmapIndex: bitmapIndex.toString(),
        bit: bit.toString()
      },
      paramTypes: UseBitFunctionParams,
      paramValues: [
        bitmapIndex,
        bit
      ]
    })
  }
}
