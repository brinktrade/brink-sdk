const { ethers } = require('hardhat')
const chai = require('chai')
const { constants } = require('@brinkninja/utils')
const { solidity } = require('ethereum-waffle')
const { MAX_UINT256 } = constants
chai.use(solidity)
const { expect } = chai

describe('AccountSigner', function () {
  describe('CancelVerifier Signing', function () {
    it('Should call cancel through a signed metaDelegateCall', async function () {
      const signedCancelFnCall = await this.accountSigner.signCancel('0', '1')
      const to = signedCancelFnCall.signedParams[0].value
      const data = signedCancelFnCall.signedParams[1].value
      const signature = signedCancelFnCall.signature
      const tx = this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
      await expect(this.account.metaDelegateCall(to, data, signature))
        .to.be.reverted
    })
  })

  describe('Limit Swap Signing', function () {
    beforeEach(async function () {
      const LimitSwapVerifier = await ethers.getContractFactory("LimitSwapVerifierMock");
      this.accountWithEmits = LimitSwapVerifier.attach(this.account.address)
    })

    it('ethToToken swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      
      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'EthToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('ethToToken swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )

      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'EthToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToEth swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        '0', '1', this.token.address, '10', '10'
      )

      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToEth')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToEth swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        '0', '1', this.token.address, '10', '10'
      )

      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToEth')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToToken swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedTokenToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        '0', '1', this.token.address, this.token.address, '10', '10', MAX_UINT256
      )

      await expect(this.account.sendLimitSwap(signedTokenToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToToken swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedTokenToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        '0', '1', this.token.address, this.token.address, '10', '10', MAX_UINT256
      )

      await expect(this.account.sendLimitSwap(signedTokenToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256, ethers.utils.getAddress(randomAddress), '0x0123')
    })
  })
})