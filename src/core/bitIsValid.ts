import { BigIntish } from '@brinkninja/types'

export type BitIsValidArgs = {
  bit: BigIntish
}

function bitIsValid ({
  bit
}: BitIsValidArgs): boolean {
  const bitBN = BigInt(bit)
  return bitBN > 0n && (bitBN & (bitBN - 1n)) == 0n
}

export default bitIsValid
