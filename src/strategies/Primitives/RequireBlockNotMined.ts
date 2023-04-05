import Primitive from '../Primitive'
import { validateUint } from '../../utils/SolidityValidation'

export default class RequireBlockNotMined extends Primitive {
  constructor (blockNumber: BigInt) {
    validateUint(blockNumber)
    super({
      functionName: 'requireBlockNotMined',
      params: [blockNumber]
    })
  }
}
