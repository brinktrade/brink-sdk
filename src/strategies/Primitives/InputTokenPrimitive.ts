import { TokenJSON } from '@brinkninja/types'
import Segment, { SegmentClassArgs } from './Primitive'

interface InputTokenSegmentClassArgs extends SegmentClassArgs {
  inputTokenParam: string
  inputAmountParam: string
}

export default class InputTokenSegment extends Segment {

  inputToken: TokenJSON
  inputAmount: string

  constructor(inputTokenSegmentArgs: InputTokenSegmentClassArgs) {
    super({
      ...inputTokenSegmentArgs
    })

    const { inputTokenParam, inputAmountParam } = inputTokenSegmentArgs

    this.inputToken = this.paramsJSON[inputTokenParam] as TokenJSON
    this.inputAmount = this.paramsJSON[inputAmountParam] as string
  }
}
