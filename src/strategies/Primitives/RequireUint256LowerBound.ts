import Primitive from '../Primitive'
import { Oracle } from '../../oracles'
import { validateAddress, validateBytes, validateUint } from '../../utils/SolidityValidation'

export default class RequireUint256LowerBound extends Primitive {

  public constructor (oracle: Oracle, lowerBound: BigInt)
  public constructor (oracle: string, oracleParams: string, lowerBound: BigInt)
  public constructor (...args: any[]) {
    let oracle, oracleParams, lowerBound

    if (args[0] instanceof Oracle) {
      oracle = args[0].contractAddress
      oracleParams = args[0].paramsEncoded
      lowerBound = args[1]
    } else {
      oracle = args[0]
      oracleParams = args[1]
      lowerBound = args[2]
    }

    validateAddress('oracle', oracle)
    validateBytes('oracleParams', oracleParams)
    validateUint('lowerBound', lowerBound)

    super({
      functionName: 'requireUint256LowerBound',
      params: [oracle, oracleParams, lowerBound]
    })
  }
}
