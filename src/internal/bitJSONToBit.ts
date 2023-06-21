import { Bit, BitJSON } from '@brinkninja/types'

export default function bitJSONToBit ({ index, value }: BitJSON): Bit {
  return {
    index: BigInt(index),
    value: BigInt(value)
  }
}
