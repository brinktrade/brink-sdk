import { ethers } from 'hardhat'
import { expect } from 'chai'
import { loadBitmap } from '@brink-sdk'

const BMP_0 = '0x0000000000000000000000000000000000000000000000000000000000000000'

describe('loadBitmap()', function () {
  it('should return rpc method call to load bitmap', async function () {
    await this.deployAccount()
    const rpcCall = loadBitmap({ signer: this.signerAddress, bitmapIndex: BigInt(0) })
    const val = await ethers.provider.send(rpcCall.method, rpcCall.params)
    expect(val).to.equal(BMP_0)
  })
})
