import { uniqWith, isEqual } from 'lodash'
import {
  IntentArgs,
  IntentJSON,
  ValidationResult,
  SegmentFunctionName,
  SegmentParamValue,
  SegmentJSON,
  TokenJSON,
  TokenAmount,
  Bit,
  BitJSON
} from '@brinkninja/types'
import Segment from './Segments/Segment'
import TokenSegment from './Segments/TokenSegment'
import { createSegment, invalidResult, validResult, groupAndSumTokenAmounts, bitJSONToBit } from '../internal'
import { bitToNonce } from '..'

export type IntentConstructorArgs = {
  segments: SegmentJSON[]
}
export interface IntentNonce {
  bit: Bit
  nonce: BigInt
  segmentIndex: Number
}

export type IntentToken = {
  token: TokenJSON
  segmentIndex: Number
  tokenParam: string
  isInput: boolean
  amount?: string
}

class Intent {

  segments: Segment[] = []

  public constructor ()
  public constructor (args: IntentArgs)
  public constructor (...arr: any[]) {
    const args: IntentArgs = arr[0] || {}

    let declarationIntentsArgs: IntentArgs = {
      segments: args?.segments || []
    }

    this.segments = declarationIntentsArgs.segments.map((segmentData: {
      functionName: SegmentFunctionName,
      params: Record<string, SegmentParamValue>
    }) => {
      return createSegment(segmentData)
    })
  }

  async tokens (): Promise<IntentToken[]> {
    let tkns: IntentToken[] = []
    for (const [i, segment] of this.segments.entries()) {
      if (segment instanceof TokenSegment) {
        (await segment.tokens()).forEach(t => {
          let tkn: IntentToken = {
            token: t.tokenData,
            segmentIndex: i,
            tokenParam: t.tokenParam,
            isInput: t.isInput
          }
          if (t.tokenAmount) {
            tkn.amount = t.tokenAmount
          }
          tkns.push(tkn)
        })
      }
    }
    return tkns
  }

  async tokenInputs (): Promise<TokenAmount[]> {
    const tokenInputs: TokenAmount[] = []
    for (const [, segment] of this.segments.entries()) {
      if (segment instanceof TokenSegment) {
        (await segment.tokens()).forEach(t => {
          if (t.isInput && t.tokenAmount) {
            tokenInputs.push({
              token: t.tokenData,
              amount: t.tokenAmount
            })
          }
        })
      }
    }
    return groupAndSumTokenAmounts(tokenInputs)
  }

  bits (): Bit[] {
    return uniqWith(this.nonces().map(n => n.bit), isEqual)
  }

  nonces (): IntentNonce[] {
    const nonces: IntentNonce[] = []
    this.segments.forEach((segment, i) => {
      if (segmentHasBitData(segment)) {
        const bit = bitJSONToBit(segment.paramsJSON as BitJSON)
        nonces.push({
          bit,
          nonce: bitToNonce({ bit }),
          segmentIndex: i
        })
      }
    })
    return nonces
  }

  async toJSON (): Promise<IntentJSON> {
    const segments = await Promise.all(
      this.segments.map(async segment => await segment.toJSON())
    )
    return {
      segments
    }
  }

  validate (): ValidationResult {
    if (this.segments.length == 0) return { valid: false }
    
    let numSwaps = 0
    for (let i = 0; i < this.segments.length; i++) {
      if (this.segments[i].type == 'swap') numSwaps++
    }
    if (numSwaps !== 1) return invalidResult('WRONG_NUMBER_OF_SWAPS')

    return validResult()
  }

}

const segmentHasBitData = (segment: Segment): boolean => (
  segment.paramsJSON.hasOwnProperty('index') && segment.paramsJSON.hasOwnProperty('value')
)

export default Intent
