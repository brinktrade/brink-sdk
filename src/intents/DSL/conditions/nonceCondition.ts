import { nonceToBit } from '../../../utils'
import { SegmentArgs, NonceState, NonceConditionArgs, BitJSON } from '@brinkninja/types'

function nonceCondition ({state, nonce} : NonceConditionArgs): SegmentArgs[] {
  const bit = nonceToBit({nonce})

  const bitJson: BitJSON = { index: bit.index.toString(), value: bit.value.toString() }

  switch (state) {
    case NonceState.USED:
      return [
        {
          functionName: 'requireBitUsed',
          params: bitJson,
        }
      ]
    case NonceState.NOT_USED:
      return [
        {
          functionName: 'requireBitNotUsed',
          params: bitJson
        }
      ]
    default:
      throw new Error(`Invalid state: ${state}`)
  }
}

export default nonceCondition
