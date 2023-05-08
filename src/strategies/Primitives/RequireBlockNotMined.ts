import Primitive from '../Primitive'
import { validateUint } from '../../internal/SolidityValidation'

export default class RequireBlockNotMinedFunction extends Primitive {
  public constructor (blockNumber: BigInt) {
    validateUint('blockNumber', blockNumber)
    super({
      functionName: 'requireBlockNotMined',
      params: [blockNumber]
    })
  }
}
