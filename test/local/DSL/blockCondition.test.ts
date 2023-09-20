import { expect } from 'chai'
import { blockCondition } from '@brink-sdk'

describe('blockCondition', function () {
  it('should return requireBlockMined primitive when state is MINED', function () {
    const primitives = blockCondition({ type: 'block', state: 'MINED', blockNumber: 12345 })
    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('requireBlockMined')
    expect(primitives[0].params.blockNumber).to.equal(12345)
  })

  it('should return requireBlockNotMined primitive when state is NOT_MINED', function () {
    const primitives = blockCondition({ type: 'block', state: 'NOT_MINED', blockNumber: 12345 })
    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('requireBlockNotMined')
    expect(primitives[0].params.blockNumber).to.equal(12345)
  })
})
