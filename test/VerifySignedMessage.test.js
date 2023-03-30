const brink = require('../src/index')
const { ethers } = require('hardhat')
const BN = ethers.BigNumber.from
const { MAX_UINT256 } = require('@brinkninja/utils').constants
const chai = require('chai')
const { expect } = chai
const { verifySignedMessage } = brink()

describe('VerifySignedMessage', function () {
  it('Verifies a correctly signed tokenToToken message', async function () {
    const signedMessage = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(BN(0), BN(1), this.token.address, this.token2.address, BN('1000000000'), BN('1000000'), MAX_UINT256)
    verifySignedMessage(signedMessage)
  })

  it('Verifies a correctly signed tokenToNft message', async function () {
    const signedMessage = await this.accountSigner.ApprovalSwapsV1.signTokenToNft(BN(0), BN(1), this.token.address, this.token2.address, BN('2817743061947399'), MAX_UINT256)
    verifySignedMessage(signedMessage)
  })

  it('Should return an error when missing param in signed message', async function () {
    const signedMessage = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(BN(0), BN(1), this.token.address, this.token2.address, BN('1000000000'), BN('1000000'), MAX_UINT256)
    signedMessage.signedParams = []
    try {
      verifySignedMessage(signedMessage)
    } catch (err) {
      expect(err.message).to.equal(`signedParams not provided in signedMessage`)
    }
  })

  it('Should return an error when typed data hash does not equal recovered hash', async function () {
    const signedMessage = {
      message: '0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529',
      EIP712TypedData: {
        types: { MetaDelegateCall: [Array] },
        domain: {
          name: 'BrinkAccount',
          version: '1213',
          chainId: 112,
          verifyingContract: '0x044e9527429b01211b06B06885E6c5873f82156C'
        },
        value: {
          to: '0x53D468E719694f3e542Dda96a237Af08eb394f2C',
          data: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0xc604e5c8c2e3b9dffdb0185eaec4a8868d549cd283e39fafe7f6027f59fa90e67245f1a7996a0a9ec68f3710aa4345c149bf7bc2e430d9ab625c34dc0ea3e32d1b',
      signer: '0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      accountAddress: '0x044e9527429b01211b06B06885E6c5873f82156C',
      functionName: 'metaDelegateCall',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToEth',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '16384' },
              {
                name: 'token',
                type: 'uint256',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              { name: 'ethAmount', type: 'uint256', value: '9019460273038' },
              {
                name: 'expiryBlock',
                type: 'uint256',
                value: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
              },
              { name: 'to', type: 'address' },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      verifySignedMessage(signedMessage)
      expect(true).to.equal(false) // Should not get here
    } catch (err) {
      expect(err.message).to.equal(`Provided signed message hash 0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529 does not match recovered hash 0xc1459c1e370739b1d679049feba95dbce754585abb7a71a82b859ead948c96ac`)
    }
  })

  it('Should return an error when signer mismatch', async function () {
    const message = {
      message: '0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529',
      EIP712TypedData: {
        types: { MetaDelegateCall: [Array] },
        domain: {
          name: 'BrinkAccount',
          version: '1',
          chainId: 1,
          verifyingContract: '0x044e9527429b01211b06B06885E6c5873f82156C'
        },
        value: {
          to: '0x53D468E719694f3e542Dda96a237Af08eb394f2C',
          data: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0xc604e5c8c2e3b9dffdb0185eaec4a8868d549cd283e39fafe7f6027f59fa90e67245f1a7996a0a9ec68f3710aa4345c149bf7bc2e430d9ab625c34dc0ea3e32d1b',
      signer: '0xa354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      accountAddress: '0x044e9527429b01211b06B06885E6c5873f82156C',
      functionName: 'metaDelegateCall',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToEth',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '16384' },
              {
                name: 'token',
                type: 'uint256',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              { name: 'ethAmount', type: 'uint256', value: '9019460273038' },
              {
                name: 'expiryBlock',
                type: 'uint256',
                value: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
              },
              { name: 'to', type: 'address' },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      verifySignedMessage(message)
      expect(true).to.equal(false) // Should not get here
    } catch (err) {
      expect(err.message).to.equal(`Provided Signer 0xa354C24DCE0f33E73C2150B5fC39B2d676a39a8f does not match Signer 0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f in Signed Message`)
    }
  })

  it('Expects computed address mismatch', async function () {
    const message = {
      message: '0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529',
      EIP712TypedData: {
        types: { MetaDelegateCall: [Array] },
        domain: {
          name: 'BrinkAccount',
          version: '1',
          chainId: 1,
          verifyingContract: '0x044e9527429b01211b06B06885E6c5873f82156C'
        },
        value: {
          to: '0x53D468E719694f3e542Dda96a237Af08eb394f2C',
          data: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0xc604e5c8c2e3b9dffdb0185eaec4a8868d549cd283e39fafe7f6027f59fa90e67245f1a7996a0a9ec68f3710aa4345c149bf7bc2e430d9ab625c34dc0ea3e32d1b',
      signer: '0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      accountAddress: '0x744e9527429b01211b06B06885E6c5873f82156C',
      functionName: 'metaDelegateCall',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToEth',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '16384' },
              {
                name: 'token',
                type: 'uint256',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              { name: 'ethAmount', type: 'uint256', value: '9019460273038' },
              {
                name: 'expiryBlock',
                type: 'uint256',
                value: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
              },
              { name: 'to', type: 'address' },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      verifySignedMessage(message)
      expect(true).to.equal(false) // Should not get here
    } catch (err) {
      expect(err.message).to.equal(`Account Address 0x744e9527429b01211b06B06885E6c5873f82156C does not match Computed Address 0x044e9527429b01211b06B06885E6c5873f82156C`)
    }
  })

  it('Should return error when calldata encoding mismatch', async function () {
    const message = {
      message: '0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529',
      EIP712TypedData: {
        types: { MetaDelegateCall: [Array] },
        domain: {
          name: 'BrinkAccount',
          version: '1',
          chainId: 1,
          verifyingContract: '0x044e9527429b01211b06B06885E6c5873f82156C'
        },
        value: {
          to: '0x53D468E719694f3e542Dda96a237Af08eb394f2C',
          data: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0xc604e5c8c2e3b9dffdb0185eaec4a8868d549cd283e39fafe7f6027f59fa90e67245f1a7996a0a9ec68f3710aa4345c149bf7bc2e430d9ab625c34dc0ea3e32d1b',
      signer: '0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      accountAddress: '0x044e9527429b01211b06B06885E6c5873f82156C',
      functionName: 'metaDelegateCall',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToEth',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '16384' },
              {
                name: 'token',
                type: 'uint256',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              { name: 'ethAmount', type: 'uint256', value: '9019460273038' },
              {
                name: 'expiryBlock',
                type: 'uint256',
                value: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
              },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      verifySignedMessage(message)
      expect(true).to.equal(false) // Should not get here
    } catch (err) {
      expect(err.message).to.equal(`Encoded bytes value does not match encoded call data params`)
    }
  })

  it('Should return error when params mismatch', async function () {
    const message = {
      message: '0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529',
      EIP712TypedData: {
        types: { MetaDelegateCall: [Array] },
        domain: {
          name: 'BrinkAccount',
          version: '1',
          chainId: 1,
          verifyingContract: '0x044e9527429b01211b06B06885E6c5873f82156C'
        },
        value: {
          to: '0x52D468E719694f3e542Dda96a237Af08eb394f2C',
          data: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0xc604e5c8c2e3b9dffdb0185eaec4a8868d549cd283e39fafe7f6027f59fa90e67245f1a7996a0a9ec68f3710aa4345c149bf7bc2e430d9ab625c34dc0ea3e32d1b',
      signer: '0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      accountAddress: '0x044e9527429b01211b06B06885E6c5873f82156C',
      functionName: 'metaDelegateCall',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToEth',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '16384' },
              {
                name: 'token',
                type: 'uint256',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              { name: 'ethAmount', type: 'uint256', value: '9019460273038' },
              {
                name: 'expiryBlock',
                type: 'uint256',
                value: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
              },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      verifySignedMessage(message)
      expect(true).to.equal(false) // Should not get here
    } catch (err) {
      expect(err.message).to.equal(`Signed message params do not match EIP712TypedData params`)
    }
  })

  it('Should return error when unsupported function name', async function () {
    const message = {
      message: '0xd4d05ba90766cfae9de8348a026a188b7378fe818cf2f94bb51a9b1c93140529',
      EIP712TypedData: {
        types: { MetaDelegateCall: [Array] },
        domain: {
          name: 'BrinkAccount',
          version: '1',
          chainId: 1,
          verifyingContract: '0x044e9527429b01211b06B06885E6c5873f82156C'
        },
        value: {
          to: '0x52D468E719694f3e542Dda96a237Af08eb394f2C',
          data: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0xc604e5c8c2e3b9dffdb0185eaec4a8868d549cd283e39fafe7f6027f59fa90e67245f1a7996a0a9ec68f3710aa4345c149bf7bc2e430d9ab625c34dc0ea3e32d1b',
      signer: '0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      accountAddress: '0x044e9527429b01211b06B06885E6c5873f82156C',
      functionName: 'delegateCall',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0x743f29da00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c20000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000000083401b9c38effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToEth',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '16384' },
              {
                name: 'token',
                type: 'uint256',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              { name: 'ethAmount', type: 'uint256', value: '9019460273038' },
              {
                name: 'expiryBlock',
                type: 'uint256',
                value: '115792089237316195423570985008687907853269984665640564039457584007913129639935'
              },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      verifySignedMessage(message)
      expect(true).to.equal(false) // Should not get here
    } catch (err) {
      expect(err.message).to.equal(`Unsupported functionName \'delegateCall\', only \'metaDelegateCall\' supported`)
    }
  })
})