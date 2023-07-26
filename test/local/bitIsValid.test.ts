import { expect } from 'chai'
import { bitIsValid } from '@brink-sdk'

describe('bitIsValid', function () {
  it('should return true for a valid bit', function () {
    expect(bitIsValid({ bit: 2n**4n })).to.equal(true)
  })

  it('should return false for an invalid bit', function () {
    expect(bitIsValid({ bit: 2n**0n | 2n**1n })).to.equal(false)
  })

  it('should return true for a very large valid bit', function () {
    expect(bitIsValid({ bit: 2n**255n })).to.equal(true)
  })

  it('should return false for a very large invalid bit', function () {
    expect(bitIsValid({ bit: 2n**254n | 2n**244n })).to.equal(false)
  })
})
