import Primitive from './Primitive'
import { Oracle } from '../../oracles'
import { OracleArgs } from '../../Types'

export type RequireUint256LowerBoundConstructorArgs = {
  oracle: OracleArgs,
  lowerBound: BigInt
}

export default class RequireUint256LowerBound extends Primitive {
  public constructor ({
    oracle,
    lowerBound
  }: RequireUint256LowerBoundConstructorArgs) {
    let uint256Oracle: string
    let params: string

    if (oracle instanceof Oracle) {
      uint256Oracle = oracle.contractAddress
      params = oracle.paramsEncoded
    } else {
      uint256Oracle = oracle.address
      params = oracle.params
    }

    super({
      functionName: 'requireUint256LowerBound',
      params: {
        uint256Oracle,
        params,
        lowerBound
      }
    })
  }

  async toJSON(): Promise<any> {
    const json = await super.toJSON()
    return {
      ...json,
      params: {
        oracle: {
          address: json.params.uint256Oracle as string,
          params: json.params.params as string
        },
        lowerBound: json.params.lowerBound as string
      }
    }
  }
}
