_ = require('lodash')
const brink = require('../index')
const { ethers } = require('hardhat')
const BN = ethers.BigNumber.from
const chai = require('chai')
const { expect } = chai

const maxExpiryBN = BN('115792089237316195423570985008687907853269984665640564039457584007913129639935')

describe('parseSignedMessage', function () {
  it('returns limitSwapEthToToken message data', async function () {
    const signedMessage = await this.accountSigner.signEthToToken(
      BN(0), BN(1), this.token.address, BN(10), BN(11), maxExpiryBN
    )
    const msg = brink.parseSignedMessage(signedMessage)
    expectMessageDataMatchForEthToTokenSwap(signedMessage, msg)
  })
  it('returns limitSwapTokenToEth message data', async function () {
    const signedMessage = await this.accountSigner.signTokenToEth(
      BN(0), BN(1), this.token.address, BN(10), BN(11), maxExpiryBN
    )
    const msg = brink.parseSignedMessage(signedMessage)
    expectMessageDataMatchForTokenToEthSwap(signedMessage, msg)
  })
  it('returns limitSwapTokenToToken message data', async function () {
    const signedMessage = await this.accountSigner.signTokenToToken(
      BN(0), BN(1), this.token.address, this.token2.address, BN(10), BN(11), maxExpiryBN
    )
    const msg = brink.parseSignedMessage(signedMessage)
    expectMessageDataMatchForTokenToTokenSwap(signedMessage, msg)
  })
  it('returns cancel message data', async function () {
    const signedMessage = await this.accountSigner.signCancel(
      BN(0), BN(1)
    )
    const msg = brink.parseSignedMessage(signedMessage)
    expectMessageDataMatchForCancel(signedMessage, msg)
  })
})

function expectMessageDataMatchForEthToTokenSwap (signedMessage, msg) {
  expectMessageDataMatch(signedMessage, msg, {
    tokenIn: { value: 'ETH' },
    tokenInAmount: 'ethAmount',
    tokenOut: 'token',
    tokenOutAmount: 'tokenAmount',
    expiryBlock: 'expiryBlock'
  })
}

function expectMessageDataMatchForTokenToEthSwap (signedMessage, msg) {
  expectMessageDataMatch(signedMessage, msg, {
    tokenIn: 'token',
    tokenInAmount: 'tokenAmount',
    tokenOut: { value: 'ETH' },
    tokenOutAmount: 'ethAmount',
    expiryBlock: 'expiryBlock'
  })
}

function expectMessageDataMatchForTokenToTokenSwap (signedMessage, msg) {
  expectMessageDataMatch(signedMessage, msg, {
    tokenIn: 'tokenIn',
    tokenInAmount: 'tokenInAmount',
    tokenOut: 'tokenOut',
    tokenOutAmount: 'tokenOutAmount',
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
