import { TokenJSON } from '@brinkninja/types'
import Primitive, { PrimitiveClassArgs } from './Primitive'

interface InputTokenPrimitiveClassArgs extends PrimitiveClassArgs {
  inputTokenParam: string
  inputAmountParam: string
}

export default class InputTokenPrimitive extends Primitive {

  inputToken: TokenJSON
  inputAmount: string

  constructor(inputTokenPrimitiveArgs: InputTokenPrimitiveClassArgs) {
    super({
      ...inputTokenPrimitiveArgs
    })

    const { inputTokenParam, inputAmountParam } = inputTokenPrimitiveArgs

    this.inputToken = this.paramsJSON[inputTokenParam] as TokenJSON
    this.inputAmount = this.paramsJSON[inputAmountParam] as string
  }
}
