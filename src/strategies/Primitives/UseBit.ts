import { BitArgs, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'
import { bitIsValid } from '../../core'

export type UseBitArgs = BitArgs

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
  public constructor ({ index, value }: UseBitArgs) {
    if (!bitIsValid({ bit: value })) {
      throw new Error('invalid bit')
    }
    super({
      functionName: 'useBit',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        index: index?.toString(),
        value: value?.toString()
      },
      paramTypes: UseBitFunctionParams,
      paramValues: [
        index?.toString(),
        value?.toString()
      ]
    })
  }
}
