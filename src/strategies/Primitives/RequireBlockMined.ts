import { BigIntish, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'

export type RequireBlockMinedArgs = {
  blockNumber: BigIntish
}

export const RequireBlockMinedFunctionParams: PrimitiveParamType[] = [
  {
    name: 'blockNumber',
    type: 'uint256',
    signed: true
  }
]

export default class RequireBlockNotMined extends Primitive {
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
