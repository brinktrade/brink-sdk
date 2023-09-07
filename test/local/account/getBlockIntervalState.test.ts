import { expect } from 'chai'
import { getBlockIntervalState } from '@brink-sdk'

describe('getBolckIntervalState()', function () {
  it('when given bit is used, should return true', function () {
    
    const slot = 12345n
    const { counter, start } = getBlockIntervalState({ slot })

    expect(counter).to.equal(0)
    expect(start).to.equal(slot)
  })
})
