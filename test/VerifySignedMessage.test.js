const brink = require('../index')
const chai = require('chai')
const { expect } = chai
describe('VerifySignedMessage', function () {
  it('Verifies a correctly signed ethToToken message', async function () {
    const message = {
      message: '0x9a781c67e07d72209ab75070a111e404569237b00e4b595fcacd7385f7aecaa5',
      signature: '0x3257eac896ce00f140da54e578062186959d51a191b5268992d6eebdefc0b8336af6a326c39281374bb7c561392dee98ceef1f2d83413d8c265ce06d3693ecb81b',
      accountAddress: '0x044e9527429b01211b06B06885E6c5873f82156C',
      signer: '0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f',
      signedParams: [
        {
          name: 'to',
          type: 'address',
          value: '0x53D468E719694f3e542Dda96a237Af08eb394f2C'
        },
        {
          name: 'data',
          type: 'bytes',
          value: '0xdc0ed0fe00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c2000000000000000000000000000000000000000000000000000009fd3ba72eec00000000000000000000000000000000000000000000000010e63b6fce33d9f0ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'ethToToken',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '512' },
              {
                name: 'token',
                type: 'address',
                value: '0x4d224452801aced8b2f0aebe155379bb5d594381'
              },
              { name: 'ethAmount', type: 'uint256', value: '10983232188140' },
              { name: 'tokenAmount', type: 'uint256', value: '2817743061947399' },
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
    brink.verifySignedMessage(message)
  })

  it('Verifies a correctly signed tokenToToken message', async function () {
    const message = {
      message: '0x4fd2bcdc5dc1358d5d204e1c0282c30fca7ea23fd45f5dc76103b8bbc1fa2fd3',
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
          data: '0x3e3d6ada00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c2000000000000000000000000ba100000625a3754423978a60c9317c58a424e3d0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000007aad6342f69ccffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
        }
      },
      signature: '0x293eedbedbf8b41fd110c5e81e2df100bdc7cdf647a63c3f7973af2680b95e656b46b5eb0b67c86271245a913a9904f1e0553e1e47a16512782ed57cfc2673f71b',
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
          value: '0x3e3d6ada00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000ff20817765cb7f73d4bde2e66e067e58d11095c2000000000000000000000000ba100000625a3754423978a60c9317c58a424e3d0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000007aad6342f69ccffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
          callData: {
            functionName: 'tokenToToken',
            params: [
              { name: 'bitmapIndex', type: 'uint256', value: '0' },
              { name: 'bit', type: 'uint256', value: '1024' },
              {
                name: 'tokenIn',
                type: 'address',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
              },
              {
                name: 'tokenOut',
                type: 'address',
                value: '0xba100000625a3754423978a60c9317c58a424e3D'
              },
              {
                name: 'tokenInAmount',
                type: 'uint256',
                value: '1000000000000000000'
              },
              {
                name: 'tokenOutAmount',
                type: 'uint256',
                value: '2158161812220364'
              },
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
    brink.verifySignedMessage(message)
  })

  it('Verifies a correctly signed tokenToEth message', async function () {
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
                type: 'address',
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
    brink.verifySignedMessage(message)
  })

  it('Expects missing param in signed tokenToEth message', async function () {
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
                type: 'address',
                value: '0xfF20817765cB7f73d4bde2e66e067E58D11095C2'
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
      brink.verifySignedMessage(message)
    } catch (err) {
      expect(err.message).to.equal(`verifySignedMessage Error: Parameter tokenAmount is not defined`)
    }
  })

  it('Expects wrong param type in signed tokenToEth message', async function () {
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
              { name: 'to', type: 'address' },
              { name: 'data', type: 'bytes' }
            ]
          }
        }
      ]
    }
    try {
      brink.verifySignedMessage(message)
    } catch (err) {
      expect(err.message).to.equal(`verifySignedMessage Error: Parameter token is of the incorrect type, should be address`)
    }
  })

  it('Expects signer mismatch', async function () {
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
      brink.verifySignedMessage(message)
    } catch (err) {
      expect(err.message).to.equal(`verifySignedMessage Error: Provided Signer 0xa354C24DCE0f33E73C2150B5fC39B2d676a39a8f does not match Signer 0xf354C24DCE0f33E73C2150B5fC39B2d676a39a8f in Signed Message`)
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
      brink.verifySignedMessage(message)
    } catch (err) {
      expect(err.message).to.equal(`verifySignedMessage Error: Account Address 0x744e9527429b01211b06B06885E6c5873f82156C does not match Computed Address 0x044e9527429b01211b06B06885E6c5873f82156C`)
    }
  })
})