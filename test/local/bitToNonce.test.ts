import { expect } from 'chai'
import { Bit } from '@brinkninja/types'
import { bitToNonce } from '@brink-sdk'

describe('bitToNonce', () => {
  it('should correctly convert bit to nonce for 0 index bit', () => {
    const bit: Bit = { index: 0n, value: BigInt(2**4) }
    const nonce = bitToNonce({ bit })
    expect(nonce).to.equal(5n)
  })

  it('should correctly convert bit to nonce for nonce 256', () => {
    const bit: Bit = { index: 0n, value: BigInt(2**255) }
    const nonce = bitToNonce({ bit })
    expect(nonce).to.equal(256n)
  })

  it('should correctly convert bit to nonce for greater than 0 index bit', () => {
    const bit: Bit = { index: 1n, value: BigInt(2**1) }
    const nonce = bitToNonce({ bit })
    expect(nonce).to.equal(258n)
  })

  it('should correctly large nonce', () => {
    const bit: Bit = { index: 3n, value: BigInt(2 ** 231) }
    const nonce = bitToNonce({ bit })
    expect(nonce).to.equal(1000n)
  })

  it('should error if bit value is not a power of 2', () => {
    const bit: Bit = { index: 0n, value: 3n }
    expect(() => bitToNonce({ bit })).to.throw('Bit value should be a power of 2')
  })

  it('should error if bit value is greater than 2**255', () => {
    const bit: Bit = { index: 0n, value: BigInt(2**255) + 1n }
    expect(() => bitToNonce({ bit })).to.throw('Bit value should be a power of 2 up to 2^255')
  })
})
