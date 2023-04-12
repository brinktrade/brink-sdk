import Primitive from '../Primitive'
import { validateUint } from '../../utils/SolidityValidation'

export default class RequireBlockNotMinedFunction extends Primitive {
  public constructor (blockNumber: BigInt) {
    validateUint('blockNumber', blockNumber)
    super({
      functionName: 'requireBlockNotMined',
      params: [blockNumber]
    })
  }
}
