import Primitive from '../Primitive'
import { validateAddress, validateBytes, validateUint } from '../../utils/SolidityValidation'

export default class RequireUint256LowerBound extends Primitive {
  constructor (
    uint256Oracle: string,
    params: string,
    lowerBound: BigInt
  ) {
    validateAddress(uint256Oracle)
    validateBytes(params)
    validateUint(lowerBound)
    super({
      functionName: 'requireUint256LowerBound',
      params: [uint256Oracle, params, lowerBound]
    })
  }
}
