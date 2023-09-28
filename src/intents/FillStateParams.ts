import { FillStateParamsJSON, FillStateParamsArgs, BigIntish, FillStateParamsStruct } from '@brinkninja/types'
import { JsonStructBuilder } from './JsonStructBuilder'

class FillStateParams implements JsonStructBuilder<FillStateParamsStruct, FillStateParamsJSON> {
  id: BigIntish
  sign: boolean
  startX96: BigIntish

  public constructor (args: FillStateParamsArgs) {
    if (!args.id) {
      throw new Error(`id is required for FillStateParams`)
    }
    this.id = args.id
    this.sign = args.sign || true
    this.startX96 = args.startX96 || 0
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
