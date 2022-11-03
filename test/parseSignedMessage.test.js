_ = require('lodash')
const brink = require('../index')
const { ethers } = require('hardhat')
const BN = ethers.BigNumber.from
const chai = require('chai')
const { MAX_UINT256 } = require('@brinkninja/utils').constants
const { expect } = chai
const { parseSignedMessage } = brink()

describe('parseSignedMessage', function () {
  it('returns tokenToToken message data', async function () {
    const signedMessage = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(
      BN(0), BN(1), this.token.address, this.token2.address, BN(10), BN(11), MAX_UINT256
    )
    const msg = parseSignedMessage(signedMessage)
    expectMessageDataMatchForTokenToTokenSwap(signedMessage, msg)
  })
  it('returns tokenToNft swap message data ', async function () {
    const signedMessage = await this.accountSigner.ApprovalSwapsV1.signTokenToNft(
      BN(0), BN(1), this.token.address, this.nft1.address, BN(10), MAX_UINT256
    )
    const msg = parseSignedMessage(signedMessage)
    expectMessageDataMatchForTokenToNftSwap(signedMessage, msg)
  })
  it('returns cancel message data', async function () {
    const signedMessage = await this.accountSigner.CancelVerifier.signCancel(
      BN(0), BN(1)
    )
    const msg = parseSignedMessage(signedMessage)
    expectMessageDataMatchForCancel(signedMessage, msg)
  })
})

function expectMessageDataMatchForTokenToTokenSwap (signedMessage, msg) {
  expectMessageDataMatch(signedMessage, msg, {
    tokenIn: 'tokenIn',
    tokenInAmount: 'tokenInAmount',
    tokenOut: 'tokenOut',
    tokenOutAmount: 'tokenOutAmount',
    expiryBlock: 'expiryBlock'
  })
}

function expectMessageDataMatchForTokenToNftSwap (signedMessage, msg) {
  expectMessageDataMatch(signedMessage, msg, {
    tokenIn: 'tokenIn',
    nftOut: 'nftOut',
    tokenInAmount: 'tokenInAmount',
    expiryBlock: 'expiryBlock'
  })
}

function expectMessageDataMatchForTokenToNftSwap (signedMessage, msg) {
  expectMessageDataMatch(signedMessage, msg, {
    tokenIn: 'tokenIn',
    nftOut: 'nftOut',
    tokenInAmount: 'tokenInAmount',
    expiryBlock: 'expiryBlock'
  })
}

function expectMessageDataMatchForCancel (signedMessage, msg) {
  // no additional params for cancel
  expectMessageDataMatch(signedMessage, msg)
}

function expectMessageDataMatch (signedMessage, msg, matchParams) {
  const match = {
    bitmapIndex: 'bitmapIndex',
    bit: 'bit',
    ...matchParams
  }

  expect(signedMessage.message).to.equal(msg.message)
  expect(signedMessage.signature).to.equal(msg.signature)
  expect(signedMessage.signer).to.equal(msg.signer)
  expect(signedMessage.accountAddress).to.equal(msg.accountAddress)
  expect(signedMessage.functionName).to.equal(msg.functionName)
  expect(signedMessage.signedParams[0].value).to.equal(msg.verifier)
  expect(signedMessage.signedParams[1].value).to.equal(msg.verifierCallData)
  expect(signedMessage.signedParams[1].callData.functionName).to.equal(msg.verifierFunctionName)

  const callParams = signedMessage.signedParams[1].callData.params
  for (let p in match) {
    const matchP = match[p]
    if (matchP.value) {
      expect(msg[p]).to.equal(matchP.value)
    } else {
      expect(msg[p]).to.equal(_.find(callParams, { name: matchP }).value)
    }
  }
}
