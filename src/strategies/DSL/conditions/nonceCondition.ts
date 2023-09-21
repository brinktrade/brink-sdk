import { PrimitiveArgs } from '@brinkninja/types'
import { NonceConditionArgs, nonceToBit, BitJSON } from '@brink-sdk'

const STATE_USED = 'USED'
const STATE_NOT_USED = 'NOT_USED'

function nonceCondition ({state, nonce} : NonceConditionArgs): PrimitiveArgs[] {
  const bit = nonceToBit({nonce})

  const bitJson: BitJSON = { index: bit.index.toString(), value: bit.value.toString() }

  switch (state) {
    case STATE_USED:
      return [
        {
          functionName: 'requireBitUsed',
          params: { bit: bitJson },
        }
      ]
    case STATE_NOT_USED:
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
