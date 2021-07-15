const { ethers } = require('hardhat')
const { chaiSolidity } = require('@brinkninja/test-helpers')
const { expect } = chaiSolidity()

describe('MessageEncoder', function () {
  beforeEach(async function () {
    await this.account.deploy()
  })

  it('Should complete an ETH transfer with delegateCall using encodeTransferEth', async function () {
    const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a155'
    await this.ethersSigner.sendTransaction({
      to: this.account.address,
      value: ethers.utils.parseEther("1.0")
    });
    const transferAmount = await ethers.utils.parseEther('0.01')
    const transferEthData = await this.messageEncoder.encodeTransferEth(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), recipientAddress, transferAmount.toString())
    const tx = await this.account.delegateCall(this.transferVerifier.address, transferEthData)
    expect(tx).to.not.be.undefined
    expect(await ethers.provider.getBalance(recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
  })

  it('Should complete a Token transfer with delegateCall using encodeTransferToken', async function () {
    const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a155'
    const transferTokenData = await this.messageEncoder.encodeTransferToken(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), this.token.address, recipientAddress, '10')
    const tx = await this.account.delegateCall(this.transferVerifier.address, transferTokenData)
    expect(tx).to.not.be.undefined
    expect(await this.token.balanceOf(recipientAddress)).to.equal('10')
  })
})