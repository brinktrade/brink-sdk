import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadBlockInterval } from '@brink-sdk'

const EMPTY_INTERVAL_0 = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe('loadBlockInterval()', function () {
  it('should return rpc method call to load bitmap', async function () {
    await this.deployAccount()
    const id = 12345n
    const rpcCall = loadBlockInterval({ signer: this.signerAddress, id })
    const val = await ethers.provider.send(rpcCall.method, rpcCall.params)
    expect(val).to.equal(EMPTY_INTERVAL_0)
  })
  it('when using invalid id, should thrown invalid', async function () {
    await this.deployAccount()
    const id = undefined
    try {
      loadBlockInterval({ signer: this.signerAddress, id: id as any })
      expect.fail('Should have thrown')
    } catch (e: any) {
      expect(e.message).to.equal('Interval id is required')
    }
  })
})
