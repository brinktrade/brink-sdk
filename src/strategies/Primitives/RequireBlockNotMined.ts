import { BigIntish, SegmentParamType } from '@brinkninja/types'
import Segment from './Primitive'

export type RequireBlockNotMinedArgs = {
  blockNumber: BigIntish
}

export const RequireBlockNotMinedFunctionParams: SegmentParamType[] = [
  {
    name: 'blockNumber',
    type: 'uint256',
    signed: true
  }
]

export default class RequireBlockNotMined extends Segment {
  public constructor ({ blockNumber }: RequireBlockNotMinedArgs) {
    super({
      functionName: 'requireBlockNotMined',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        blockNumber: blockNumber?.toString()
      },
      paramTypes: RequireBlockNotMinedFunctionParams,
      paramValues: [
        blockNumber?.toString()
      ]
    })
  }
}
