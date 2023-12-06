import { expect } from 'chai'
import { encodeParams } from '@brink-sdk/internal'

describe('encodeParams', function () {
  it('should encode params to bytes data string', function () {
    expect(encodeParams({
      params: ['0x5d74e912550423B71752b1b1D453e839E5414F4C', 123n],
      paramTypes: [{ name: 'addr', type: 'address' }, { name: 'n', type: 'uint256' }]
    })).to.equal('0x0000000000000000000000005d74e912550423b71752b1b1d453e839e5414f4c000000000000000000000000000000000000000000000000000000000000007b')
  })

  it('should throw error when params and types length do not match', function () {
    expect(encodeParams.bind(null, {
      params: ['0x5d74e912550423B71752b1b1D453e839E5414F4C', 123n, 456n],
      paramTypes: [{ name: 'addr', type: 'address' }, { name: 'n', type: 'uint256' }]
    })).to.throw('Error encoding params')
  })
})
