import { Bit } from '@brinkninja/types'

function bitToNonce ({
  bit
}: {
  bit: Bit
}): BigInt {
  const { index, value } = bit
  if (value > BigInt(2**255)) {
    throw new Error('Bit value should be a power of 2 up to 2^255')
  }

  const logValue = Math.log2(Number(value))
  if (!Number.isInteger(logValue)) {
    throw new Error('Bit value should be a power of 2')
  }
  return BigInt(index) * BigInt(256) + BigInt(logValue) + BigInt(1)
}

export default bitToNonce
