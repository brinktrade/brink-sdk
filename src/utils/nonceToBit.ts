import { BigIntish, Bit } from '@brinkninja/types'

function nonceToBit ({
  nonce: nonceArg
}: {
  nonce: BigIntish
}): Bit {
  const nonce = BigInt(nonceArg)
  if (nonce <= BigInt(0)) {
    throw new Error('Nonce should be greater than 0')
  }
  const index = (nonce - BigInt(1)) / BigInt(256)
  const value = BigInt(2) ** ((nonce - BigInt(1)) % BigInt(256))
  return { index, value }
}

export default nonceToBit