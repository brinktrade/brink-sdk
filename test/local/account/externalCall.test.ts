import { ethers } from 'hardhat'
import { expect } from 'chai'
import { externalCall } from '@brink-sdk'

describe('externalCall', function () {
  beforeEach(async function () {
    await this.deployAccount()
    await this.fundAccount()
  })

  it('should send externalCall tx', async function () {
    const transferAmount = BigInt((await ethers.utils.parseEther('0.01')).toString())
    const tx = await externalCall(this.accountAddress, transferAmount, this.recipientAddress, '0x')
    const receipt = await this.ethersAccountSigner.sendTransaction(tx)
    expect(receipt).to.not.be.undefined
    expect((await ethers.provider.getBalance(this.recipientAddress)).toString()).to.equal(ethers.utils.parseEther('0.01').toString())
  })
})
