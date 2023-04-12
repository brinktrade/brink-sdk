import Primitive from '../Primitive'
import { validateUint } from '../../utils/SolidityValidation'

export default class UseBit extends Primitive {
  public constructor (bitmapIndex: BigInt, bit: BigInt) {
    validateUint('bitmapIndex', bitmapIndex)
    validateUint('bitmapIndex', bit)
    super({
      functionName: 'useBit',
      params: [bitmapIndex, bit]
    })
  }
}
