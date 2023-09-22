import { NOT_USED_NONCE_STATE, PrimitiveArgs, USED_NONCE_STATE } from '@brinkninja/types'
import { NonceConditionArgs, nonceToBit, BitJSON } from '@brink-sdk'

function nonceCondition ({state, nonce} : NonceConditionArgs): PrimitiveArgs[] {
  const bit = nonceToBit({nonce})

  const bitJson: BitJSON = { index: bit.index.toString(), value: bit.value.toString() }

  switch (state) {
    case USED_NONCE_STATE:
      return [
        {
          functionName: 'requireBitUsed',
          params: { bit: bitJson },
        }
      ]
    case NOT_USED_NONCE_STATE:
      return [
        {
          functionName: 'requireBitNotUsed',
          params: { bit: bitJson }
        }
      ]
    default:
      throw new Error(`Invalid state: ${state}`)
  }
}

export default nonceCondition
