const { ethers } = require('hardhat')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const { solidity } = require('ethereum-waffle')
const { randomHex } = require('web3-utils')
const BigNumber = require('bignumber.js')
const { constants } = require('@brinkninja/utils')
const proxyAccountFromOwner = require('../src/proxyAccountFromOwner')
const BN = ethers.BigNumber.from
const { MAX_UINT256 } = constants
chai.use(chaiAsPromised)
chai.use(solidity)
const { expect } = chai

const mockGasPrice = BN(123).mul(BN(10).pow(BN(9)))

describe('Account', function () {

  beforeEach(async function () {
    this.recipientAddress = randomHex(20)

    this.fundAccount = async () => {
      await this.defaultSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther('1.0')
      })
    }

    this.fulfillTokenOutData = (await this.testFulfillSwap.populateTransaction.fulfillTokenOutSwap(
      this.token2.address, '10', this.ownerAddress
    )).data

    // this patches in a mock storageLoad function, which will load storage from this.mockAccountBits
    // the "MockAccountBits" contract, instead of the proxy account. This let's us test bit reading functions
    // with mocked bitmap stored values
    const mockAccountBitsAddr = this.mockAccountBits.address
    this.patchMockStorageLoad = () => {
      this.account.storageLoad = (async function (pos) {
        const val = await this._provider.getStorageAt(mockAccountBitsAddr, pos)
        return val
      }).bind(this.account)
    }

    await this.token.connect(this.ethersAccountSigner).approve(this.account.address, '10')
    this.signedTokenToTokenSwap = await this.accountSigner.ApprovalSwapsV1.signTokenToToken(
      '0', '1', this.token.address, this.token2.address, '10', '10', MAX_UINT256
    )
  })

  describe('populateTransaction', function () {
    it('should wrap call to ethers populateTranscation', async function () {
      await this.fundAccount()
      await this.account.deploy()
      const res = await this.account.populateTransaction.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData
      )
      const { contractName, functionName, params, paramTypes, data, to, from } = res
      expect(contractName).not.to.be.undefined
      expect(functionName).not.to.be.undefined
      expect(params).not.to.be.undefined
      expect(paramTypes).not.to.be.undefined
      expect(data).not.to.be.undefined
      expect(to).not.to.be.undefined
      expect(from).not.to.be.undefined
    })

    it('should use gasPrice override when provided', async function () {
      await this.fundAccount()
      const res = await this.account.populateTransaction.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData, { gasPrice: mockGasPrice }
      )
      expect(res.gasPrice).to.equal(mockGasPrice)
    })
  })

  describe('estimateGas', function () {
    it('should wrap call to ethers estimateGas', async function () {
      await this.fundAccount()
      const res = await this.account.estimateGas.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData
      )
      expect(res.gas).to.be.gt(0)
    })

    it('should use gasLimit override when provided', async function () {
      await this.fundAccount()
      await expect(this.account.estimateGas.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData, { gasLimit: 20000 }
      )).to.be.rejectedWith('insufficient funds for intrinsic transaction cost')
    })
  })

  describe('callStatic', function () {
    it('should wrap call to ethers callStatic', async function () {
      await this.fundAccount()
      const res = await this.account.callStatic.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData
      ) 
      expect(res.returnValues).not.to.be.undefined
    })

    it('should use gasLimit override when provided', async function () {
      await this.fundAccount()
      await expect(this.account.callStatic.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData, { gasLimit: 20000 }
      )).to.be.rejectedWith('insufficient funds for intrinsic transaction cost')
    })
  })

  describe('ApprovalSwapsV1.tokenToToken function', function () {
    it('should send an ETH to ERC20 swap tx', async function () {
      await this.fundAccount()

      const ownerBal0 = await this.token2.balanceOf(this.ownerAddress)

      await this.account.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData
      )

      const ownerBal1 = await this.token2.balanceOf(this.ownerAddress)
      expect(ownerBal1.sub(ownerBal0)).to.equal(BN('10'))
    })

    it('should send an ERC20 to ERC20 swap (without account deployment', async function () {
      await this.fundAccount()
      const ownerBal0 = await this.token2.balanceOf(this.ownerAddress)
      await this.account.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData
      )
      const ownerBal1 = await this.token2.balanceOf(this.ownerAddress)
      expect(ownerBal1.sub(ownerBal0)).to.equal(BN('10'))
    })

    it('should use gasPrice override when provided', async function () {
      await this.fundAccount()
      const res = await this.account.ApprovalSwapsV1.tokenToToken(
        this.signedTokenToTokenSwap, this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData, { gasPrice: mockGasPrice }
      )
      expect(res.gasPrice).to.equal(mockGasPrice)
    })
  })

  describe('deploy', function () {
    describe('when given valid params', function () {
      beforeEach(async function () {
        await this.account.deploy()
      })

      it('should deploy the account', async function () {
        expect(await this.account.isDeployed()).to.be.true
      })

      it('should set the account address', function () {
        const expectedAccountAddress = proxyAccountFromOwner(this.ownerAddress)
        expect(this.account.address).to.equal(expectedAccountAddress)
      })
    })

    describe('when account is already deployed', function () {
      it('should throw an error', async function () {
        await this.account.deploy()
        await expect(this.account.deploy()).to.be.rejectedWith('Account contract already deployed')
      })
    })

    it('should use gasPrice override when provided', async function () {
      const res = await this.account.deploy({ gasPrice: mockGasPrice })
      expect(res.gasPrice).to.equal(mockGasPrice)
    })
  })

  describe('externalCall', function () {
    beforeEach(async function () {
      await this.account.deploy()
    })

    it('should send externalCall tx', async function () {
      await this.fundAccount()
      const transferAmount = await ethers.utils.parseEther('0.01')
      const tx = await this.account_ownerSigner.externalCall(transferAmount.toString(), this.recipientAddress, '0x')
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
    })

    it('should use gasPrice override when provided', async function () {
      await this.fundAccount()
      const transferAmount = await ethers.utils.parseEther('0.01')
      const tx = await this.account_ownerSigner.externalCall(transferAmount.toString(), this.recipientAddress, '0x', { gasPrice: mockGasPrice })
      expect(tx.gasPrice).to.equal(mockGasPrice)
    })
  })

  describe('delegateCall', function () {
    beforeEach(async function () {
      await this.account.deploy()
    })

    it('should send delegateCall tx', async function () {
      await this.fundAccount()
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.encodeEthTransfer('0', '1', this.recipientAddress, transferAmount.toString())
      const tx = await this.account_ownerSigner.delegateCall(this.transferVerifier.address, transferEthData)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
    })

    it('should use gasPrice override when provided', async function () {
      await this.fundAccount()
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.encodeEthTransfer('0', '1', this.recipientAddress, transferAmount.toString())
      const tx = await this.account_ownerSigner.delegateCall(this.transferVerifier.address, transferEthData, { gasPrice: mockGasPrice })
      expect(tx.gasPrice).to.equal(mockGasPrice)
    })
  })

  describe('metaDelegateCall', function () {
    it('should send eth transfer via metaDelegateCall', async function () {
      await this.fundAccount()
      this.transferAmt = BN('10')

      const signedEthTransferCall = await this.accountSigner.TransferVerifier.signEthTransfer(
        '0', '1', this.recipientAddress, this.transferAmt, MAX_UINT256
      )
      
      const tx = await this.account.metaDelegateCall(signedEthTransferCall)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(this.transferAmt)
    })

    it('should send swap via metaDelegateCall', async function () {
      await this.fundAccount()
      await this.account.deploy()
      const ownerBal0 = await this.token2.balanceOf(this.ownerAddress)
      await this.account.metaDelegateCall(
        this.signedTokenToTokenSwap, [this.testFulfillSwap.address, this.testFulfillSwap.address, this.fulfillTokenOutData]
      )
      const ownerBal1 = await this.token2.balanceOf(this.ownerAddress)
      expect(ownerBal1.sub(ownerBal0)).to.equal(BN('10'))
    })

    it('should use gasPrice override when provided', async function () {
      await this.fundAccount()
      this.transferAmt = BN('10')

      const signedEthTransferCall = await this.accountSigner.TransferVerifier.signEthTransfer(
        '0', '1', this.recipientAddress, this.transferAmt, MAX_UINT256
      )
      
      const tx = await this.account.metaDelegateCall(signedEthTransferCall, [], { gasPrice: mockGasPrice })
      expect(tx.gasPrice).to.equal(mockGasPrice)
    })
  })

  describe('isDeployed()', function () {
    it('should return true when contract is deployed', async function () {
      await this.account.deploy()
      expect(await this.account.isDeployed()).to.be.true
    })
  })

  describe('nextBit()', function () {
    describe('when the account proxy is deployed', function () {
      it('should return next available bit', async function () {
        await this.account.deploy()
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(bitmapIndex).to.equal(0)
        expect(bit).to.equal(1)
      })
    })

    describe('when the account proxy has not been deployed', function () {
      it('should return the first bit', async function () {
        const { bitmapIndex, bit } = await this.account.nextBit()
        expect(bitmapIndex).to.equal(0)
        expect(bit).to.equal(1)
      })
    })

    // TODO: can't use the mock implementation now that addresses are deterministic ... re-write these tests
    describe('when bits have been stored consecutively', function () {
      it('should return first available bit after stored bits', async function () {
        this.patchMockStorageLoad()
        await this.account.deploy()
        await this.mockAccountBits.__mockBitmap(0, base2BN('111'))
        const { bitmapIndex, bit } = await this.account.nextBit()
        const expectedBitIndex = BN(3)
        expect(bitmapIndex).to.equal(BN(0))
        expect(bit).to.equal(BN(2).pow(expectedBitIndex))
      })
    })

    describe('when bits have been stored non-consecutively', function () {
      it('should return first available bit', async function () {
        this.patchMockStorageLoad()
        await this.account.deploy()
        // mock first 4 bits flipped, 5th unflipped, 6 and 7th flipped
        await this.mockAccountBits.__mockBitmap(BN(0), base2BN(reverseBinStr('1111011')))
        const { bitmapIndex, bit } = await this.account.nextBit()
        const expectedBitIndex = BN(4)
        expect(bitmapIndex).to.equal(BN(0))
        expect(bit).to.equal(BN(2).pow(expectedBitIndex))
      })
    })

    describe('when exactly 256 bits have been stored', function () {
      it('should return first bit from the next storage slot', async function () {
        this.patchMockStorageLoad()
        await this.account.deploy()
        // mock 256 bits flipped
        await this.mockAccountBits.__mockBitmap(BN(0), base2BN('1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111'))
        const { bitmapIndex, bit } = await this.account.nextBit()
        const expectedBitIndex = BN(0)
        expect(bitmapIndex).to.equal(BN(1))
        expect(bit).to.equal(BN(2).pow(expectedBitIndex))
      })
    })
  })

  describe('loadBitmap', function () {
    beforeEach(function () {
      this.patchMockStorageLoad()
    })
    it('when account is not deployed, should return 0', async function () {
      const bmp = await this.account.loadBitmap(0)
      expect(bmp).to.equal(0)
    })
    it('when account is deployed, should return the bitmap', async function () {
      await this.account.deploy()
      const bnVal = base2BN(reverseBinStr('0011'))
      await this.mockAccountBits.__mockBitmap(BN(0), bnVal)
      const bmp = await this.account.loadBitmap(0)
      expect(bmp).to.equal(bnVal)
    })
  })

  describe('bitUsed', function () {
    beforeEach(function () {
      this.patchMockStorageLoad()
    })
    it('when given bit is used, should return true', async function () {
      await this.account.deploy()
      // mock bits 0,1,2 unused. 3,4,5 used 
      await this.mockAccountBits.__mockBitmap(BN(0), base2BN(reverseBinStr('000111')))
      const bit = BN(2).pow(BN(3))
      expect(await this.account.bitUsed(0, bit)).to.equal(true)
    })
    it('when given bit is not used, should return false', async function () {
      await this.account.deploy()
      // mock bits 0,1,2 unused. 3,4,5 used 
      await this.mockAccountBits.__mockBitmap(BN(0), base2BN(reverseBinStr('000111')))
      const bit = BN(2).pow(BN(2))
      expect(await this.account.bitUsed(0, bit)).to.equal(false)
    })
    it('when account is not deployed, should return false', async function () {
      const bit = BN(2).pow(BN(3))
      expect(await this.account.bitUsed(0, bit)).to.equal(false)
    })
  })
})

// convert a base 2 (binary) string to an ethers.js BigNumber
function base2BN (str) {
  // uses the bignumber.js lib which supports base 2 conversion
  return BN(new BigNumber(str, 2).toFixed())
}

function reverseBinStr (str) {
  return str.split('').reverse().join('')
}

// TMP
function splitCallData (callData, numSignedParams) {
  let parsedCallData = callData.indexOf('0x') == 0 ? callData.slice(2) : callData
  // signed data is the prefix + fnSig + signedParams
  const bytes32SlotLen = 64 
  const fnSigLen = 8
  const signedDataLen = fnSigLen + (numSignedParams * bytes32SlotLen)
  const signedData = `0x${parsedCallData.slice(0, signedDataLen)}`

  // unsigned data is the rest
  const unsignedData = `0x${parsedCallData.slice(signedDataLen)}`
  return { signedData, unsignedData }
}
