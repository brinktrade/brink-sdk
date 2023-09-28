import { expect } from 'chai'
import { blockCondition } from '@brink-sdk'

describe('blockCondition', function () {
  it('should return requireBlockMined segment when state is MINED', function () {
    const segments = blockCondition({ type: 'block', state: 'MINED', blockNumber: 12345 })
    expect(segments.length).to.equal(1)
    expect(segments[0].functionName).to.equal('requireBlockMined')
    expect(segments[0].params.blockNumber).to.equal(12345)
  })

  it('should return requireBlockNotMined segment when state is NOT_MINED', function () {
    const segments = blockCondition({ type: 'block', state: 'NOT_MINED', blockNumber: 12345 })
    expect(segments.length).to.equal(1)
    expect(segments[0].functionName).to.equal('requireBlockNotMined')
    expect(segments[0].params.blockNumber).to.equal(12345)
  })
})
