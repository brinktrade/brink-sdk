const { ethers } = require('hardhat')
const chai = require('chai')
const { randomHex } = require('web3-utils')
const { BN: ethersBN } = require('@brinkninja/utils')
const { toBN: web3BN } = require('web3-utils')
const { solidity } = require('ethereum-waffle')
const { MAX_UINT256, ZERO_ADDRESS } = require('@brinkninja/utils').constants
const { Strategy, Order, UseBit } = require('../src/strategies')
const brink = require('../src/index')

const BN = ethers.BigNumber.from
chai.use(solidity)
const { expect } = chai

describe('AccountSigner', function () {
  describe('Cancel Signing', function() {
    it('Cancel', async function () {
      expect(await this.account_ownerSigner.bitUsed('0', '1')).to.be.false
      const signedCancel = await this.accountSigner.CancelVerifier.signCancel('0', '1')
      await this.account_ownerSigner.CancelVerifier.cancel(signedCancel)
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

      const signedEthTransfer = await this.accountSigner.TransferVerifier.signEthTransfer(
        '0', '1', this.recipientAddress, this.transferAmt.toString(), MAX_UINT256
      )
      
      const tx = await this.account.TransferVerifier.ethTransfer(signedEthTransfer)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('1.0'))
      expect(await this.account.bitUsed('0', '1')).to.be.true
    })

    it('tokenTransfer', async function () {
      const signedTokenTransfer = await this.accountSigner.TransferVerifier.signTokenTransfer(
        '0', '1', this.token.address, this.recipientAddress, '1000', MAX_UINT256
      )
      
      const tx = await this.account.TransferVerifier.tokenTransfer(signedTokenTransfer)
      expect(tx).to.not.be.undefined
      expect(await this.token.balanceOf(this.recipientAddress)).to.equal('1000')
      expect(await this.account.bitUsed('0', '1')).to.be.true
    })
  })

  describe('Approval Swap Signing', function () {
    beforeEach(async function () {  
      this.fulfillTokenOutData = (await this.testFulfillSwap.populateTransaction.fulfillTokenOutSwap(
        this.token2.address, '10', this.ownerAddress
      )).data
  
      this.fulfillEthOutData = (await this.testFulfillSwap.populateTransaction.fulfillEthOutSwap(
        '10', this.ownerAddress
      )).data
    })

    it('tokenToToken swap', async function () {
      await this.token.connect(this.ethersAccountSigner).approve(this.account.address, '10')
      const signedTokenToTokenSwap = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(
        '0', '1', this.token.address, this.token2.address, '10', '10', MAX_UINT256
      )
      const ownerBal0 = await this.token2.balanceOf(this.ownerAddress)
      await this.account.ApprovalSwapsV1.tokenToToken(
        signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData
      )
      const ownerBal1 = await this.token2.balanceOf(this.ownerAddress)
      expect(ownerBal1.sub(ownerBal0)).to.equal(BN('10'))
    })

    it('tokenToToken swap with ETH output', async function () {
      await this.token.connect(this.ethersAccountSigner).approve(this.account.address, '10')
      const signedTokenToTokenSwap = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(
        '0', '1', this.token.address, ZERO_ADDRESS, '10', '10', MAX_UINT256
      )
      const ownerBal0 = await ethers.provider.getBalance(this.ownerAddress)
      await this.account.ApprovalSwapsV1.tokenToToken(
        signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillEthOutData
      )
      const ownerBal1 = await ethers.provider.getBalance(this.ownerAddress)
      expect(ownerBal1.sub(ownerBal0)).to.equal(BN('10'))
    })

    describe('when given BN values', function () {
      it('signEthToTokenSwap should correctly encode ethers.js BN', async function () {
        await tokenToTokenSignWithBnTest.call(this, ethersBN)
      })
      it('signEthToTokenSwap should correctly encode web3 BN', async function () {
        await tokenToTokenSignWithBnTest.call(this, web3BN)
      })
    })
  })

  describe('NFT Approval Swap Signing', function () {
    beforeEach(async function () {
      this.fulfillNftOutData = (await this.testFulfillSwap.populateTransaction.fulfillNftOutSwap(
        this.nft1.address, this.cryptoSkunkID, this.accountSigner.signerAddress()
      )).data
    })

    it('tokenToNft swap', async function () {
      await this.account.deploy()
      const signedTokenToNftSwap = await this.accountSigner.ApprovalSwapsV1.signTokenToNft(
        '0', '1', this.token.address, this.nft1.address, '10', MAX_UINT256
      )
      await this.token.connect(this.ethersAccountSigner).approve(this.account.address, '10')
      const ownerBal0 = await this.nft1.balanceOf(this.accountSigner.signerAddress())
      const recipientBal0 = await this.token.balanceOf(this.testFulfillSwap.address)
      await this.account.ApprovalSwapsV1.tokenToNft(
        signedTokenToNftSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillNftOutData
      )
      const ownerBal1 = await this.nft1.balanceOf(this.accountSigner.signerAddress())
      expect(ownerBal1.sub(ownerBal0)).to.equal(BN('1'))
      const recipientBal1 = await this.token.balanceOf(this.testFulfillSwap.address)
      expect(recipientBal1.sub(recipientBal0)).to.equal(BN('10'))
    })
  })

  describe('Wrong \'v\' value in signature (Ledger)', function() {
    it('when signer signs with invalid ECDSA \'v\' value', async function () {
      // sign with the "bad v" signer that mocks what ledger does
      const signedEthTransfer = await this.accountSignerBadV.TransferVerifier.signEthTransfer(
        '0', '1', randomHex(20), ethers.utils.parseEther('1.0').toString(), MAX_UINT256
      )

      const { signature } = signedEthTransfer
      const v = signature.slice(2+64+64, 2+64+64+2)
        
      expect(v == '1b' || v == '1c').to.be.true
    })
  })

  describe('custom verifiers', function () {
    it('should expose a verifier signing function', async function () {
      const doThingVerifierDef = {
        "functionName": "doThing",
        "functionSignature": "doThing(uint256,uint256)",
        "functionSignatureHash": "0x3c447f23",
        "contractName": "FakeVerifier",
        "contractAddress": "0xE100eF1C4339Dd4E4b54d5cBB6CcEfA96071E227",
        "paramTypes": [
          {
            "name": "paramOne",
            "type": "uint256",
            "signed": true
          },
          {
            "name": "paramTwo",
            "type": "uint256",
            "signed": false
          }
        ]
      }
      const { AccountSigner, verifySignedMessage } = brink({
        network: 'hardhat',
        verifiers: [doThingVerifierDef]
      })
      const signer = AccountSigner(this.ethersAccountSigner)
      const signedMsg = await signer.FakeVerifier.signDoThing(123)
      verifySignedMessage(signedMsg)
      expect(signedMsg.signedParams[0].value).to.equal(doThingVerifierDef.contractAddress)
    })
  })

  describe('strategy signing', function () {
    it('should sign a strategy', async function () {
      const strategyData = await buildStrategy()
      const signedStrategy = await this.accountSigner.signStrategyEIP712(strategyData)
      expect(signedStrategy.strategy).not.to.be.undefined
    })

    it('should throw validation error when signing invalid strategy', async function () {
      const strategy = new Strategy()
      strategy.orders[0] = new Order()
      strategy.orders[0].primitives[0] = new UseBit(0, 1)
      await expect(this.accountSigner.signStrategyEIP712(await strategy.toJSON())).to.be.rejectedWith('Invalid strategy: WRONG_NUMBER_OF_SWAPS: All orders must have exactly 1 swap')
    })
  })
})

async function tokenToTokenSignWithBnTest(_BN) {
  const signedSwap = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(
    _BN(0), _BN(1), this.token.address, this.token2.address, _BN(10), _BN(10), _BN('115792089237316195423570985008687907853269984665640564039457584007913129639935')
  )
  const { params } = signedSwap.signedParams[1].callData
  expect(params[0].value).to.equal('0')
  expect(params[1].value).to.equal('1')
  expect(params[4].value).to.equal('10')
  expect(params[5].value).to.equal('10')
  expect(params[6].value).to.equal('115792089237316195423570985008687907853269984665640564039457584007913129639935')
}

async function buildStrategy () {
  const strategy1 = new Strategy(
    {
      orders: [
        {
          primitives: [
            {
              functionName: 'useBit',
              params: [0, 1]
            },
            {
              functionName: 'marketSwapExactInput',
              params: [
                '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
                '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8',
                '0x6399ae010188F36e469FB6E62C859dDFc558328A',
                [
                  0,
                  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                  0,
                  false
                ],
                [
                  0,
                  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                  0,
                  false
                ],
                1450000000,
                10000,
                0
              ]
            }
          ]
        }
      ]
    }
  )
  return await strategy1.toJSON()
}
