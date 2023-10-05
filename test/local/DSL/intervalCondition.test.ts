import { expect } from 'chai'
import { intervalCondition } from '@brink-sdk'

describe('intervalCondition', function () {
  it('should generate blockInterval segment with id, intervalMinBlocks, and default values for initialStart and maxIntervals', function () {
    const segments = intervalCondition({ type: 'interval', id: 1, interval: 100 })
    expect(segments.length).to.equal(1)
    expect(segments[0].functionName).to.equal('blockInterval')
    expect(segments[0].params.id).to.equal(1)
    expect(segments[0].params.intervalMinSize).to.equal(100)
    expect(segments[0].params.initialStart).to.equal(0) // Default value
    expect(segments[0].params.maxIntervals).to.equal(0) // Default value
  })

  it('should use provided initialStartBlock value', function () {
    const segments = intervalCondition({ type: 'interval', id: 1, interval: 100, startBlock: 50 })
    expect(segments[0].params.initialStart).to.equal(50)
  })

  it('should use provided maxIntervals value', function () {
    const segments = intervalCondition({ type: 'interval', id: 1, interval: 100, maxIntervals: 10 })
    expect(segments[0].params.maxIntervals).to.equal(10)
  })
})
