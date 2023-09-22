import { OracleJSON, BigIntish, PrimitiveParamType } from '@brinkninja/types'
import Primitive from './Primitive'

export type RequireUint256UpperBoundArgs = {
  oracle: OracleJSON,
  upperBound: BigIntish
}

export const RequireUint256UpperBoundFunctionParams: PrimitiveParamType[] = [
  {
    name: 'uint256Oracle',
    type: 'address',
    signed: true
  },
  {
    name: 'params',
    type: 'bytes',
    signed: true
  },
  {
    name: 'upperBound',
    type: 'uint256',
    signed: true
  }
]

export default class RequireUint256LowerBound extends Primitive {
  public constructor ({
    oracle,
    upperBound
  }: RequireUint256UpperBoundArgs) {
    super({
      functionName: 'requireUint256UpperBound',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        oracle,
        upperBound: upperBound?.toString()
      },
      paramTypes: RequireUint256UpperBoundFunctionParams,
      paramValues: [
        oracle?.address,
        oracle?.params,
        upperBound?.toString()
      ]
    })
  }
}
