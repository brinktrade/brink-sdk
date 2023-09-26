import { expect } from 'chai'
import { intervalCondition } from '@brink-sdk'

describe('intervalCondition', function () {
  it('should generate blockInterval primitive with id, intervalMinBlocks, and default values for initialStart and maxIntervals', function () {
    const primitives = intervalCondition({ type: 'interval', id: 1, intervalMinBlocks: 100 })
    expect(primitives.length).to.equal(1)
    expect(primitives[0].functionName).to.equal('blockInterval')
    expect(primitives[0].params.id).to.equal(1)
    expect(primitives[0].params.intervalMinBlocks).to.equal(100)
    expect(primitives[0].params.initialStart).to.equal(0) // Default value
    expect(primitives[0].params.maxIntervals).to.equal(0) // Default value
  })

  it('should use provided initialStartBlock value', function () {
    const primitives = intervalCondition({ type: 'interval', id: 1, intervalMinBlocks: 100, initialStartBlock: 50 })
    expect(primitives[0].params.initialStart).to.equal(50)
  })

  it('should use provided maxIntervals value', function () {
    const primitives = intervalCondition({ type: 'interval', id: 1, intervalMinBlocks: 100, maxIntervals: 10 })
    expect(primitives[0].params.maxIntervals).to.equal(10)
  })
})
