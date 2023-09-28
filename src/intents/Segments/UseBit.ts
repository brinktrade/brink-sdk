import { BitArgs, SegmentParamType } from '@brinkninja/types'
import Segment from './Segment'
import { bitIsValid } from '../../core'

export type UseBitArgs = BitArgs

export const UseBitFunctionParams: SegmentParamType[] = [
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

export default class UseBit extends Segment {
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
