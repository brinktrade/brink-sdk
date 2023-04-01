import Primitive from '../Primitive'
import { Uint } from '../../utils/SolidityTypes'
import { validateUint } from '../../utils/SolidityValidation'

export default class UseBit extends Primitive {
  constructor (bitmapIndex: Uint, bit: Uint) {
    validateUint(bitmapIndex)
    validateUint(bit)
    super({
      functionName: 'useBit',
      params: [bitmapIndex, bit]
    })
  }
}
