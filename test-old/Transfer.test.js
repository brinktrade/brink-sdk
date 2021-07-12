const { expect } = require('chai')
const { toBN: BN, utf8ToHex } = require('web3-utils')
const { accounts, web3, contract } = require('@openzeppelin/test-environment')
const sendEth = require('./helpers/sendEth')
const setupUniswap = require('./helpers/setupUniswap')
const setupSingletonFactory = require('./helpers/setupSingletonFactory')
const { AccountSigner, PrivateKeySigner, Transfer } = require('../src')
const { transferTypes } = require('../src/constants')

const [ a, b, liqProviderA, liqProviderB, recipientAddr ] = accounts

const chainId = 1

const AccountLogic = contract.fromArtifact('AccountLogic')
const CallExecutor = contract.fromArtifact('CallExecutor')

const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

describe('Transfer', function () {
  beforeEach(async function () {
    this.callExecutor = await CallExecutor.new()
    this.singletonFactory = await setupSingletonFactory()
    this.accountLogic = await AccountLogic.new(this.callExecutor.address)

    const { tokenA } = await setupUniswap(liqProviderA, liqProviderB)
    this.tokenA = tokenA

    const privateKeySigner = new PrivateKeySigner(ownerPrivateKey)
    this.accountSigner = new AccountSigner({
      accountVersion: '1',
      chainId,
      signer: privateKeySigner
    })
    this.accountSigner.initFromParams(
      this.singletonFactory.address,
      this.accountLogic.address,
      chainId,
      utf8ToHex('<<account|deployment|salt>>')
    )
    
    this.firstBit = {
      bitmapIndex: BN(0),
      bit: BN(1)
    }
  })

  describe('invalid functionName', function () {
    it('should throw an error', async function () {
      let signedFunctionCall = mockSignedEthTransfer()
      signedFunctionCall.functionName = 'invalidFnName'
      expect(newTransfer.bind(this, signedFunctionCall)).to.throw('Invalid signedFunctionCall: expected functionName "invalidFnName" to be "executeCall"')
    })
  })

  describe('type()', function () {
    beforeEach(async function () {
      this.transferAmount = BN(3).mul(BN(10**18))
    })

    describe('when signedFunctionCall is an eth transfer call', function () {
      it('should return ETH', async function () {
        const signedFunctionCall = await this.accountSigner.signTransferEth(
          this.firstBit, recipientAddr, this.transferAmount
        )
        const transfer = newTransfer(signedFunctionCall)
        expect(await transfer.type()).to.equal(transferTypes.ETH)
      })
    })

    describe('when signedFunctionCall is a token transfer call', function () {
      it('should return TOKEN', async function () {
        const signedFunctionCall = await this.accountSigner.signTransferToken(
          this.firstBit, this.tokenA.address, recipientAddr, this.transferAmount
        )
        const transfer = newTransfer(signedFunctionCall)
        expect(await transfer.type()).to.equal(transferTypes.TOKEN)
      })
    })
  })
  
  describe('accountAddress()', function () {
    it('should return the accountAddress from signedFunctionCall', function () {
      const signedFnCall = mockSignedEthTransfer()
      const transfer = newTransfer(signedFnCall)
      expect(transfer.accountAddress()).to.equal(signedFnCall.accountAddress)
    })
  })

  describe('recipient()', function () {
    describe('when transfer is eth', function () {
      it('should return recipient address from transaction params', function () {
        const signedFnCall = mockSignedEthTransfer()
        const transfer = newTransfer(signedFnCall)
        expect(transfer.recipient()).to.equal(signedFnCall.params[1].toLowerCase())
      })
    })

    describe('when transfer is token', function () {
      it('should return recipient address from token transfer call params', function () {
        const signedFnCall = mockSignedTokenTransfer()
        const transfer = newTransfer(signedFnCall)
        expect(transfer.recipient()).to.equal(signedFnCall.call.params[0].toLowerCase())
      })
    })
  })

  describe('amount()', function () {
    describe('when transfer is eth', function () {
      it('should return BN value from transaction params', function () {
        const signedFnCall = mockSignedEthTransfer()
        const transfer = newTransfer(signedFnCall)
        expect(transfer.amount()).to.be.bignumber.equal(BN(signedFnCall.params[0]))
      })
    })

    describe('when transfer is token', function () {
      it('should return BN value from token transfer call params', function () {
        const signedFnCall = mockSignedTokenTransfer()
        const transfer = newTransfer(signedFnCall)
        expect(transfer.amount()).to.be.bignumber.equal(BN(signedFnCall.call.params[1]))
      })
    })
  })

  describe('token()', function () {
    describe('when transfer is eth', function () {
      it('should return "ETH"', function () {
        const signedFnCall = mockSignedEthTransfer()
        const transfer = newTransfer(signedFnCall)
        expect(transfer.token()).to.equal('ETH')
      })
    })

    describe('when transfer is token', function () {
      it('should return the token address', function () {
        const signedFnCall = mockSignedTokenTransfer()
        const transfer = newTransfer(signedFnCall)
        expect(transfer.token()).to.equal(signedFnCall.params[1].toLowerCase())
      })
    })
  })
})

function newTransfer (signedFunctionCall) {
  return new Transfer({ web3, signedFunctionCall })
}

function mockSignedEthTransfer () {
  return {
    message: '0xa65246d56f9851e508473410d7f666e2f2418f10221bbfb3b3230b37f5f4e68d',
    signature:
    '0xcefdf8702df6af5ba8235680339610c8456e9fdb311c6f2f39cc974571dd84f34c74d8d1cf6b6b5133255618b409bee866430e53481d1b4e34f80bb59eaa1f1c1c',
    signer: '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829',
    accountAddress: '0x0780c0d469ddcc81040ed121f60bec71f56a7e38',
    functionName: 'executeCall',
    bitmapIndex: '0',
    bit: '1',
    paramTypes: [ 'uint', 'address', 'bytes' ],
    params: [
      '3000000000000000000',
      '0x90f381455697A6a671Be84E5FB153171D2F96eBc',
      '0x'
    ],
    call: { functionName: null, paramTypes: [], params: [] },
    callEncoded: '0x'
  }
}

function mockSignedTokenTransfer () {
  return {
    message: '0xdc82cc8cd08c0c9b817a2a2657a5cea6ccba8267e0dfa11bc91dc509d2caf72f',
    signature:
    '0x0c49d2f97bb3a0d52c8ecaa68d5c92cd03bd89d5b91f54f0f14b0056d906361b7a2c120a0f455803b29c9db4312e3766cf6360a47e7905179401f12f96cdbdee1b',
    signer: '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829',
    accountAddress: '0x986e9924a1925fa70f0fe18b7a7bf8ea5a0c710c',
    functionName: 'executeCall',
    bitmapIndex: '0',
    bit: '1',
    paramTypes: [ 'uint', 'address', 'bytes' ],
    params: [
      '0',
      '0x38258Bd235457A94Ea0dce5004C9328b7eB157fB',
      '0xa9059cbb0000000000000000000000001c60a7bb9410aadcb62d8ff3399be5ce2ca48cc900000000000000000000000000000000000000000000000029a2241af62c0000'
    ],
    call: {
      functionName: 'transfer',
      paramTypes: [ 'address', 'uint' ],
      params: [
        '0x1C60a7bB9410AadCb62D8ff3399Be5CE2Ca48Cc9',
        '3000000000000000000'
      ]
    },
    callEncoded: '0xa9059cbb0000000000000000000000001c60a7bb9410aadcb62d8ff3399be5ce2ca48cc900000000000000000000000000000000000000000000000029a2241af62c0000'
  }
}
