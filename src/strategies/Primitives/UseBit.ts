import Primitive from '../Primitive'

export default class UseBit extends Primitive {

  constructor (bitmapIndex: number, bit: number) {
    super({
      functionName: 'useBit',
      params: [bitmapIndex, bit]
    })
  }

}
