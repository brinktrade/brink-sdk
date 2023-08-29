import { FillStateParamsJSON, FillStateParamsArgs, BigIntish, FillStateParamsStruct } from '@brinkninja/types'

class FillStateParams {
  id: BigIntish
  sign: boolean
  startX96: BigIntish

  public constructor (args: FillStateParamsArgs) {
    this.id = args.id
    this.sign = args.sign
    this.startX96 = args.startX96
  }

  public toStruct(): FillStateParamsStruct {
    return {
      id: BigInt(this.id),
      sign: this.sign,
      startX96: BigInt(this.startX96)
    }
  }

  public toJSON(): FillStateParamsJSON {
    return {
      id: this.id.toString(),
      sign: this.sign,
      startX96: this.startX96.toString()
    }
  }

}

export default FillStateParams
