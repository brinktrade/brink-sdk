const { ethers } = require('hardhat')

const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

const brinkUtils = require('@brinkninja/utils')
const {
  MAX_UINT_256
} = brinkUtils.test
const { chaiSolidity } = require('@brinkninja/test-helpers')
const { expect } = chaiSolidity()

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

  describe('ProxyAdminVerifier Signing', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.accountWithEmits = ProxyAdminVerifier.attach(this.account.address)
    })

    it('Should call upgradeTo through a signed metaDelegateCall', async function () {
      const randomAddress = '0x13be228b8fc88ef382f0615f385b50690313a155'
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(randomAddress)
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })

    it('Should call setProxyOwner through a signed metaDelegateCall', async function () {
      const newOwner = '0x13be228b8fc88ef382f0615f385b50690313a177'
      const signedSetProxyOwnerFnCall = await this.accountSigner.signSetProxyOwner(newOwner)
      const to = signedSetProxyOwnerFnCall.signedParams[0].value
      const data = signedSetProxyOwnerFnCall.signedParams[1].value
      const signature = signedSetProxyOwnerFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
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
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('ethToToken swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )

      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'EthToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToEth swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        '0', '1', this.token.address, '10', '10'
      )

      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToEth')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToEth swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        '0', '1', this.token.address, '10', '10'
      )

      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToEth')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToToken swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedTokenToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        '0', '1', this.token.address, this.token.address, '10', '10', MAX_UINT_256
      )

      await expect(this.account.sendLimitSwap(signedTokenToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToToken swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedTokenToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        '0', '1', this.token.address, this.token.address, '10', '10', MAX_UINT_256
      )

      await expect(this.account.sendLimitSwap(signedTokenToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.accountWithEmits, 'TokenToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })
  })
})