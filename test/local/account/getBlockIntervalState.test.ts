import { expect } from 'chai'
import { getBlockIntervalState } from '@brink-sdk'

describe('getBlockIntervalState()', function () {
  it('when slot is empty, should return 0 for start and counter', function () {
    const slot = 0
    const { counter, start } = getBlockIntervalState({ slot })
    expect(counter).to.equal(0)
    expect(start).to.equal(slot)
  })

  it('when slot is max uint256 value, should return uint16 max value for counter and uint128 max value for start', function () {
    const slot = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
    const { counter, start } = getBlockIntervalState({ slot })
    expect(counter).to.equal(0xFFFF)
    expect(start).to.equal(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) 
  })

  it('when start and counter are both non zero values in slot, should return the values for each', function () {
    const slot = '0x000000000000000000000000000000FF00000000000000000000000000000FFF'
    const { counter, start } = getBlockIntervalState({ slot })
    expect(counter).to.equal(0xFF)
    expect(start).to.equal(0xFFF) 
  })
})
