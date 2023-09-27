import { BitArgs, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'
import { bitIsValid } from '../../core'

export type RequireBitNotUsedArgs = BitArgs

export const RequireBitNotUsedFunctionParams: PrimitiveParamType[] = [
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

export default class RequireBitNotUsed extends Primitive {
  public constructor ({ index, value }: RequireBitNotUsedArgs) {
    if (!bitIsValid({ bit: value })) {
      throw new Error('invalid bit')
    }
    super({
      functionName: 'requireBitNotUsed',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        index: index?.toString(),
        value: value?.toString()
      },
      paramTypes: RequireBitNotUsedFunctionParams,
      paramValues: [
        index?.toString(),
        value?.toString()
      ]
    })
  }
}
