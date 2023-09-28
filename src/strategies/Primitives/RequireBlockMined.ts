import { BigIntish, SegmentParamType } from '@brinkninja/types'
import Segment from './Primitive'

export type RequireBlockMinedArgs = {
  blockNumber: BigIntish
}

export const RequireBlockMinedFunctionParams: SegmentParamType[] = [
  {
    name: 'blockNumber',
    type: 'uint256',
    signed: true
  }
]

export default class RequireBlockNotMined extends Segment {
  public constructor ({ blockNumber }: RequireBlockMinedArgs) {
    super({
      functionName: 'requireBlockMined',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        blockNumber: blockNumber?.toString()
      },
      paramTypes: RequireBlockMinedFunctionParams,
      paramValues: [
        blockNumber?.toString()
      ]
    })
  }
}
