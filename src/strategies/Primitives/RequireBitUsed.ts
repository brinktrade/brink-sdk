import { BitArgs, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'
import { bitIsValid } from '../../core'

export type RequireBitUsedArgs = BitArgs

export const RequireBitUsedFunctionParams: PrimitiveParamType[] = [
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

export default class RequireBitUsed extends Primitive {
  public constructor ({ index, value }: RequireBitUsedArgs) {
    if (!bitIsValid({ bit: value })) {
      throw new Error('invalid bit')
    }
    super({
      functionName: 'requireBitUsed',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        index: index?.toString(),
        value: value?.toString()
      },
      paramTypes: RequireBitUsedFunctionParams,
      paramValues: [
        index?.toString(),
        value?.toString()
      ]
    })
  }
}
