import { expect } from 'chai'
import { nonceToBit } from '@brink-sdk'

describe('nonceToBit', () => {
  it('should correctly convert nonce to bit for 0 index', () => {
    const bit = nonceToBit({ nonce: 5 })
    expect(bit.index).to.equal(0n)
    expect(bit.value).to.equal(BigInt(2**4))
  })

  it('should correctly convert nonce to bit for greater than 0 index', () => {
    const nonce = 258
    const bit = nonceToBit({ nonce })
    expect(bit.index).to.equal(1n)
    expect(bit.value).to.equal(BigInt(2**1))
  })

  it('should error if nonce is 0', () => {
    expect(() => nonceToBit({ nonce: 0 })).to.throw('Nonce should be greater than 0')
  })

  it('should correctly convert large nonce', () => {
    const bit = nonceToBit({ nonce: 1000 })
    expect(bit.index).to.equal(3n)
    expect(bit.value).to.equal(BigInt(2**231))
  })
})
