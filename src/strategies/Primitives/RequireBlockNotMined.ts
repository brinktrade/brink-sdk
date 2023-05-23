import { BigIntish, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'

export type RequireBlockNotMinedArgs = {
  blockNumber: BigIntish
}

export const RequireBlockNotMinedFunctionParams: PrimitiveParamType[] = [
  {
    name: 'blockNumber',
    type: 'uint256',
    signed: true
  }
]

export default class RequireBlockNotMined extends Primitive {
  public constructor ({ blockNumber }: RequireBlockNotMinedArgs) {
    super({
      functionName: 'requireBlockNotMined',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        blockNumber: blockNumber.toString()
      },
      paramTypes: RequireBlockNotMinedFunctionParams,
      paramValues: [
        blockNumber.toString()
      ]
    })
  }
}
