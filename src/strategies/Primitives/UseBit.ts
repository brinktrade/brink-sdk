import Primitive from '../Primitive'
import { validateUint } from '../../utils/SolidityValidation'

export default class UseBit extends Primitive {
  constructor (bitmapIndex: BigInt, bit: BigInt) {
    validateUint(bitmapIndex)
    validateUint(bit)
    super({
      functionName: 'useBit',
      params: [bitmapIndex, bit]
    })
  }
}
