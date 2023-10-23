import {
  IntentArgs,
  IntentJSON,
  ValidationResult,
  SegmentFunctionName,
  SegmentParamValue,
  SegmentJSON,
  TokenAmount,
  Bit,
  BitJSON
} from '@brinkninja/types'
import Segment from './Segments/Segment'
import InputTokenSegment from './Segments/InputTokenSegment'
import { createSegment, invalidResult, validResult, groupAndSumTokenAmounts, bitJSONToBit } from '../internal'
import { bitToNonce } from '..'

export type IntentConstructorArgs = {
  segments: SegmentJSON[]
}
export interface BitNoncePair {
  bit: Bit
  nonce: BigInt
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

  tokenInputs (): TokenAmount[] {
    const tokenInputs: TokenAmount[] = []
    this.segments.forEach(segment => {
      if (segment instanceof InputTokenSegment) {
        tokenInputs.push({
          token: segment.inputToken,
          amount: segment.inputAmount
        })
      }
    })
    return groupAndSumTokenAmounts(tokenInputs)
  }

  bits (): Bit[] {
    const bits: Bit[] = []
    this.segments.forEach(segment => {
      if (segmentHasBitData(segment)) {
        const bit = bitJSONToBit(segment.paramsJSON as BitJSON)
        if(!bits.find(existingBit => (     
          existingBit.index == bit.index &&
          existingBit.value == bit.value
        ))) {
          bits.push(bit)
        }
      }
    })
    return bits
  }

  nonces (): BitNoncePair[] {    
    return this.bits().map(bit => ({ bit, nonce: bitToNonce({ bit })}))
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
