import { PrimitiveArgs } from '@brinkninja/types'
import { NonceConditionArgs, nonceToBit } from '@brink-sdk'

const STATE_USED = 'USED'
const STATE_NOT_USED = 'NOT_USED'

function nonceCondition ({state, nonce} : NonceConditionArgs): PrimitiveArgs[] {
  const bit = nonceToBit({nonce})

  switch (state) {
    case STATE_USED:
      return [
        {
          functionName: 'requireBitUsed',
          params: {
            bitmapIndex: bit.index,
            bit: bit.value,
          }
        }
      ]
    case STATE_NOT_USED:
      return [
        {
          functionName: 'requireBitNotUsed',
          params: {
            bitmapIndex: bit.index,
            bit: bit.value,
          }
        }
      ]
    default:
      throw new Error(`Invalid state: ${state}`)
  }
}

export default nonceCondition
