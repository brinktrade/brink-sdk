import { expect } from 'chai'
import { decodeParams } from '@brink-sdk/internal'

describe('decodeParams', function () {
  it('should encode params to bytes data string', function () {
    const p = decodeParams({
      data: '0x0000000000000000000000005d74e912550423b71752b1b1d453e839e5414f4cffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      paramTypes: [{ name: 'addr', type: 'address' }, { name: 'n', type: 'uint256' }]
    })
    expect(p[0]).to.equal('0x5d74e912550423b71752b1b1d453e839e5414f4c')
    expect(p[1]).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  })

  it('should throw error when data and types do not match', function () {
    expect(decodeParams.bind(null, {
      data: '0x0000000000000000000000005d74e912550423b71752b1b1d453e839e5414f4c',
      paramTypes: [{ name: 'addr', type: 'address' }, { name: 'n', type: 'uint256' }]
    })).to.throw('Error decoding params data for types')
  })
})
