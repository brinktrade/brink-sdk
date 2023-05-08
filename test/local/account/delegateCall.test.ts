import { ethers } from 'hardhat'
import { expect } from 'chai'
import { delegateCall } from '@brink-sdk'

describe('delegateCall', function () {
  it('should send delegateCall tx', async function () {
    await this.deployAccount()
    await this.fundAccount()
    const transferAmount = await ethers.utils.parseEther('0.01')
    const transferEthData = await this.encodeEthTransfer('0', '1', this.recipientAddress, transferAmount.toString())
    const tx = await delegateCall({
      signer: this.signerAddress,
      to: this.transferVerifier.address,
      data: transferEthData
    })
    const receipt = await this.ethersAccountSigner.sendTransaction(tx)
    expect(receipt).to.not.be.undefined
    expect((await ethers.provider.getBalance(this.recipientAddress)).toString()).to.equal(ethers.utils.parseEther('0.01').toString())
  })
})
