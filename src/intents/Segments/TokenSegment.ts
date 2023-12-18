import { TokenJSON } from '@brinkninja/types'
import Segment, { SegmentClassArgs } from './Segment'

type TokenSegmentParam = {
  tokenParam: string
  getTokenAmount?: () => Promise<string | undefined>
  isInput: boolean
}

type TokenSegmentJSON = {
  tokenData: TokenJSON
  tokenParam: string
  isInput: boolean
  tokenAmount?: string
}

interface TokenSegmentClassArgs extends SegmentClassArgs {
  tokenParams: TokenSegmentParam[]
}

export default class TokenSegment extends Segment {

  tokens: () => Promise<TokenSegmentJSON[]>

  constructor(tokenSegmentArgs: TokenSegmentClassArgs) {
    super({
      ...tokenSegmentArgs
    })

    const { tokenParams } = tokenSegmentArgs

    this.tokens = async (): Promise<TokenSegmentJSON[]> => {
      return Promise.all(tokenParams.map(async p => {
        let tknSegJson: TokenSegmentJSON = {
          tokenData: this.paramsJSON[p.tokenParam] as TokenJSON,
          tokenParam: p.tokenParam,
          isInput: p.isInput
        }
        if (p.getTokenAmount) {
          const amt = await p.getTokenAmount()
          if (amt) {
            tknSegJson.tokenAmount = amt
          }
        }
        return tknSegJson
      }))
    }
  }
}
