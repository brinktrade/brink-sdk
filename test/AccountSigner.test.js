const { ethers } = require('hardhat')
const chai = require('chai')
const { constants, BN: ethersBN } = require('@brinkninja/utils')
const { toBN: web3BN } = require('web3-utils')
const { solidity } = require('ethereum-waffle')
const { MAX_UINT256 } = constants
chai.use(solidity)
const { expect } = chai

describe('AccountSigner', function () {
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

    describe('when given BN values', function () {
      it('signEthToTokenSwap should correctly encode ethers.js BN', async function () {
        await ethToTokenSignWithBnTest.call(this, ethersBN)
      })
      it('signEthToTokenSwap should correctly encode web3 BN', async function () {
        await ethToTokenSignWithBnTest.call(this, web3BN)
      })
      it('signTokenToEthSwap should correctly encode ethers.js BN', async function () {
        await tokenToEthSignWithBnTest.call(this, ethersBN)
      })
      it('signTokenToEthSwap should correctly encode web3 BN', async function () {
        await tokenToEthSignWithBnTest.call(this, web3BN)
      })
      it('signTokenToTokenSwap should correctly encode ethers.js BN', async function () {
        await tokenToTokenSignWithBnTest.call(this, ethersBN)
      })
      it('signTokenToTokenSwap should correctly encode web3 BN', async function () {
        await tokenToTokenSignWithBnTest.call(this, web3BN)
      })
    })
  })
})

async function ethToTokenSignWithBnTest(_BN) {
  const signedSwap = await this.accountSigner.signEthToTokenSwap(
    _BN(0), _BN(1), this.token.address, _BN(10), _BN(10), _BN('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  )
  const { params } = signedSwap.signedParams[1].callData
  expect(params[0].value).to.equal('0')
  expect(params[1].value).to.equal('1')
  expect(params[3].value).to.equal('10')
  expect(params[4].value).to.equal('10')
  expect(params[5].value).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935')
}

async function tokenToEthSignWithBnTest(_BN) {
  const signedSwap = await this.accountSigner.signTokenToEthSwap(
    _BN(0), _BN(1), this.token.address, _BN(10), _BN(10), _BN('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  )
  const { params } = signedSwap.signedParams[1].callData
  expect(params[0].value).to.equal('0')
  expect(params[1].value).to.equal('1')
  expect(params[3].value).to.equal('10')
  expect(params[4].value).to.equal('10')
  expect(params[5].value).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935')
}
async function tokenToTokenSignWithBnTest(_BN) {
  const signedSwap = await this.accountSigner.signTokenToTokenSwap(
    _BN(0), _BN(1), this.token.address, this.token.address, _BN(10), _BN(10), _BN('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  )
  const { params } = signedSwap.signedParams[1].callData
  expect(params[0].value).to.equal('0')
  expect(params[1].value).to.equal('1')
  expect(params[4].value).to.equal('10')
  expect(params[5].value).to.equal('10')
  expect(params[6].value).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935')
}
