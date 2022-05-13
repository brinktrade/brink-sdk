const { ethers } = require('hardhat')
const chai = require('chai')
const { randomHex } = require('web3-utils')
const { BN: ethersBN } = require('@brinkninja/utils')
const { toBN: web3BN } = require('web3-utils')
const { solidity } = require('ethereum-waffle')
const { MAX_UINT256 } = require('@brinkninja/utils').constants

const BN = ethers.BigNumber.from
chai.use(solidity)
const { expect } = chai

describe('AccountSigner', function () {
  describe('Cancel Signing', function() {
    it('Cancel', async function () {
      expect(await this.account_ownerSigner.bitUsed('0', '1')).to.be.false
      const signedCancel = await this.accountSigner.signCancel('0', '1')
      await this.account_ownerSigner.cancel(signedCancel)
      expect(await this.account_ownerSigner.bitUsed('0', '1')).to.be.true
      const { bitmapIndex, bit } = await this.account_ownerSigner.nextBit()
      expect(await this.account_ownerSigner.bitUsed(bitmapIndex, bit)).to.be.false
    })
  })

  describe('Transfer Signing', function() {
    beforeEach(async function () {
      this.recipientAddress = randomHex(20)
    })

    it('ethTransfer', async function () {
      this.transferAmt = ethers.utils.parseEther('1.0')
      await this.defaultSigner.sendTransaction({
        to: this.account.address,
        value: this.transferAmt
      })

      const signedEthTransfer = await this.accountSigner.signEthTransfer(
        '0', '1', this.recipientAddress, this.transferAmt.toString(), MAX_UINT256
      )
      
      const tx = await this.account.ethTransfer(signedEthTransfer)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('1.0'))
      expect(await this.account.bitUsed('0', '1')).to.be.true
    })

    it('tokenTransfer', async function () {
      const signedTokenTransfer = await this.accountSigner.signTokenTransfer(
        '0', '1', this.token.address, this.recipientAddress, '1000', MAX_UINT256
      )
      
      const tx = await this.account.tokenTransfer(signedTokenTransfer)
      expect(tx).to.not.be.undefined
      expect(await this.token.balanceOf(this.recipientAddress)).to.equal('1000')
      expect(await this.account.bitUsed('0', '1')).to.be.true
    })
  })

  describe('Limit Swap Signing', function () {
    beforeEach(async function () {
      this.fundAccount = async () => {
        await this.defaultSigner.sendTransaction({
          to: this.account.address,
          value: ethers.utils.parseEther('1.0')
        })
      }
  
      this.fulfillTokenOutData = (await this.testFulfillSwap.populateTransaction.fulfillTokenOutSwap(
        this.token.address, '10', this.account.address
      )).data
  
      this.fulfillToken2OutData = (await this.testFulfillSwap.populateTransaction.fulfillTokenOutSwap(
        this.token2.address, '10', this.account.address
      )).data
  
      this.fulfillEthOutData = (await this.testFulfillSwap.populateTransaction.fulfillEthOutSwap(
        '10', this.account.address
      )).data
    })

    it('ethToToken swap', async function () {
      await this.fundAccount()
      const signedEthToTokenSwap = await this.accountSigner.signEthToToken(
        '0', '1', this.token.address, '10', '10', MAX_UINT256
      )
      const acctBal0 = await this.token.balanceOf(this.account.address)
      await this.account.ethToToken(
        signedEthToTokenSwap, this.testFulfillSwap.address, this.fulfillTokenOutData
      )
      const acctBal1 = await this.token.balanceOf(this.account.address)
      expect(acctBal1.sub(acctBal0)).to.equal(BN('10'))
    })

    it('tokenToEth swap', async function () {
      const signedTokenToEthSwap = await this.accountSigner.signTokenToEth(
        '0', '1', this.token.address, '10', '10', MAX_UINT256
      )
      const acctBal0 = await ethers.provider.getBalance(this.account.address)
      await this.account.ethToToken(
        signedTokenToEthSwap, this.testFulfillSwap.address, this.fulfillEthOutData
      )
      const acctBal1 = await ethers.provider.getBalance(this.account.address)
      expect(acctBal1.sub(acctBal0)).to.equal(BN('10'))
    })

    it('tokenToToken swap', async function () {
      await this.fundAccount()
      const signedTokenToTokenSwap = await this.accountSigner.signTokenToToken(
        '0', '1', this.token.address, this.token2.address, '5', '10', MAX_UINT256
      )
      const acctBal0 = await this.token2.balanceOf(this.account.address)
      await this.account.ethToToken(
        signedTokenToTokenSwap, this.testFulfillSwap.address, this.fulfillToken2OutData
      )
      const acctBal1 = await this.token2.balanceOf(this.account.address)
      expect(acctBal1.sub(acctBal0)).to.equal(BN('10'))
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

  describe('NFT Limit Swap Signing', function () {
    beforeEach(async function () {
      this.fulfillNftOutData = (await this.testFulfillSwap.populateTransaction.fulfillNftOutSwap(
        this.nft1.address, this.cryptoSkunkID, this.account.address
      )).data
    })

    it('tokenToNft swap', async function () {
      await this.account.deploy()
      const signedTokenToNftSwap = await this.accountSigner.signTokenToNft(
        '0', '1', this.token.address, this.nft1.address, '10', MAX_UINT256
      )
      const acctBal0 = await this.nft1.balanceOf(this.account.address)
      await this.account.tokenToNft(
        signedTokenToNftSwap, this.testFulfillSwap.address, this.fulfillNftOutData
      )
      const acctBal1 = await this.nft1.balanceOf(this.account.address)
      expect(acctBal1.sub(acctBal0)).to.equal(BN('1'))
    })
  })

  describe('Wrong \'v\' value in signature (Ledger)', function() {
    it('when signer signs with invalid ECDSA \'v\' value', async function () {
      // sign with the "bad v" signer that mocks what ledger does
      const signedEthTransfer = await this.accountSignerBadV.signEthTransfer(
        '0', '1', randomHex(20), ethers.utils.parseEther('1.0').toString(), MAX_UINT256
      )

      const { signature } = signedEthTransfer
      const v = signature.slice(2+64+64, 2+64+64+2)
        
      expect(v == '1b' || v == '1c').to.be.true
    })
  })
})

async function ethToTokenSignWithBnTest(_BN) {
  const signedSwap = await this.accountSigner.signEthToToken(
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
  const signedSwap = await this.accountSigner.signTokenToEth(
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
  const signedSwap = await this.accountSigner.signTokenToToken(
    _BN(0), _BN(1), this.token.address, this.token.address, _BN(10), _BN(10), _BN('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  )
  const { params } = signedSwap.signedParams[1].callData
  expect(params[0].value).to.equal('0')
  expect(params[1].value).to.equal('1')
  expect(params[4].value).to.equal('10')
  expect(params[5].value).to.equal('10')
  expect(params[6].value).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935')
}
