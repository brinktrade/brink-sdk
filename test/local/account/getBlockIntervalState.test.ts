import { expect } from 'chai'
import { getBlockIntervalState } from '@brink-sdk'

describe('getBolckIntervalState()', function () {
  it('when slot is not used, should return 0', function () {
    const slot = 0
    const { counter, start } = getBlockIntervalState({ slot })
    expect(counter).to.equal(0)
    expect(start).to.equal(slot)
  })

  it("when is all 1's, should return true", function () {
    const slot = '0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'
    const { counter, start } = getBlockIntervalState({ slot })
    expect(counter).to.equal(0xFFFF)
    expect(start).to.equal(0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF) 
  })

  it("Should return 0xFF for counter and 0xFFF for start", function () {
    const slot = '0x000000000000000000000000000000FF00000000000000000000000000000FFF'
    const { counter, start } = getBlockIntervalState({ slot })
    expect(counter).to.equal(0xFF)
    expect(start).to.equal(0xFFF) 
  })
})
