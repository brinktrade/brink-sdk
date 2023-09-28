import { OracleJSON, BigIntish, SegmentParamType } from '@brinkninja/types'
import Segment from './Primitive'

export type RequireUint256LowerBoundArgs = {
  oracle: OracleJSON,
  lowerBound: BigIntish
}

export const RequireUint256LowerBoundFunctionParams: SegmentParamType[] = [
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
    name: 'lowerBound',
    type: 'uint256',
    signed: true
  }
]

export default class RequireUint256LowerBound extends Segment {
  public constructor ({
    oracle,
    lowerBound
  }: RequireUint256LowerBoundArgs) {
    super({
      functionName: 'requireUint256LowerBound',
      type: 'require',
      requiresUnsignedCall: false,
      paramsJSON: {
        oracle,
        lowerBound: lowerBound?.toString()
      },
      paramTypes: RequireUint256LowerBoundFunctionParams,
      paramValues: [
        oracle?.address,
        oracle?.params,
        lowerBound?.toString()
      ]
    })
  }
}
