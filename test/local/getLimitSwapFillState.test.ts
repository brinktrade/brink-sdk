import { expect } from 'chai'
import { getLimitSwapFillState, getSignerAccount } from '@brink-sdk'

describe('getLimitSwapFillState', function () {
  it('should return an RPC call to get fill state stored in signer account', async function () {
    const rpcCall = getLimitSwapFillState({
      signer: this.signerAddress,
      fillStateId: BigInt(123)
    })
    expect(rpcCall.method).to.equal('eth_getStorageAt')
    expect(rpcCall.params[0]).to.equal(getSignerAccount({ signer: this.signerAddress }))
    expect(rpcCall.params[1]).to.equal('0x1c49baf4c1ae77d3ad48b99ebf8343667348d1815f3e4e567ed0e0489b0b25c1')
  })
})
