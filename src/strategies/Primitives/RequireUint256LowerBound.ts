import Primitive from './Primitive'
import { Oracle } from '../../oracles'
import { OracleJSON, BigIntish, PrimitiveJSON } from '@brinkninja/types'

export type RequireUint256LowerBoundConstructorArgs = {
  oracle: OracleJSON,
  lowerBound: BigIntish
}

export default class RequireUint256LowerBound extends Primitive {
  public constructor ({
    oracle,
    lowerBound
  }: RequireUint256LowerBoundConstructorArgs) {
    super({
      functionName: 'requireUint256LowerBound',
      params: {
        uint256Oracle: oracle.address,
        params: oracle.params,
        lowerBound
      }
    })
  }

  async toJSON(): Promise<PrimitiveJSON> {
    const json = await super.toJSON()
    return {
      ...json,
      params: {
        oracle: {
          address: json.params.uint256Oracle as string,
          params: json.params.params as string
        },
        lowerBound: BigInt(json.params.lowerBound as string)
      }
    }
  }
}
