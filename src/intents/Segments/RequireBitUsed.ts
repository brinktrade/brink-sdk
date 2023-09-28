import { BitArgs, SegmentParamType } from '@brinkninja/types'
import Segment from './Segment'
import { bitIsValid } from '../../core'

export type RequireBitUsedArgs = BitArgs

export const RequireBitUsedFunctionParams: SegmentParamType[] = [
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

export default class RequireBitUsed extends Segment {
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
