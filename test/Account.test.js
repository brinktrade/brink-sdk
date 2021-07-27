const { ethers } = require('hardhat')
const { randomHex } = require('web3-utils')
const chaiAsPromised = require('chai-as-promised')
const { testHelpers, BN, constants } = require('@brinkninja/utils')
const computeAccountAddress = require('../src/computeAccountAddress')

const { MAX_UINT256 } = constants
const { chaiSolidity } = testHelpers(ethers)
const chai = chaiSolidity()
chai.use(chaiAsPromised)
const { expect } = chai

const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'

describe('Account', function () {

  beforeEach(async function () {
    const LimitSwapVerifier = await ethers.getContractFactory('LimitSwapVerifierMock')
    this.account_limitSwapVerifier = LimitSwapVerifier.attach(this.account.address)

    this.recipientAddress = randomHex(20)
  })

  describe('populateTransaction', function () {
    it('should wrap call to ethers populateTranscation', async function () {
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      const res = await this.account.populateTransaction.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123')
      const { contractName, functionName, params, paramTypes, data, to, from } = res
      expect(contractName).not.to.be.undefined
      expect(functionName).not.to.be.undefined
      expect(params).not.to.be.undefined
      expect(paramTypes).not.to.be.undefined
      expect(data).not.to.be.undefined
      expect(to).not.to.be.undefined
      expect(from).not.to.be.undefined
    })
  })

  describe('estimateGas', function () {
    it('should wrap call to ethers estimateGas', async function () {
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      const res = await this.account.estimateGas.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123')
      expect(res.gas).to.be.gt(0)
    })
  })

  describe('callStatic', function () {
    it('should wrap call to ethers callStatic', async function () {
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      const res = await this.account.callStatic.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123')
      expect(res.returnValues).not.to.be.undefined
    })
  })

  describe('sendLimitSwap', function () {
    it('should send a limit swap tx', async function () {
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      await expect(this.account.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123'))
        .to.emit(this.account_limitSwapVerifier, 'EthToToken')
        .withArgs(
          '0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256,
          ethers.utils.getAddress(randomAddress), '0x0123'
        )
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
        const expectedAccountAddress = computeAccountAddress(
          this.singletonFactory.address,
          this.accountContract.address,
          this.ownerAddress,
          this.chainId,
          this.accountSalt
        )
        expect(this.account.address).to.equal(expectedAccountAddress)
      })
    })

    describe('when account is already deployed', function () {
      it('should throw an error', async function () {
        await this.account.deploy()
        await expect(this.account.deploy()).to.be.rejectedWith('Account contract already deployed')
      })
    })
  })

  describe('externalCall', function () {
    beforeEach(async function () {
      await this.account.deploy()
    })

    it('should send externalCall tx', async function () {
      await this.defaultSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther('1.0')
      })
      const transferAmount = await ethers.utils.parseEther('0.01')
      const tx = await this.account_ownerSigner.externalCall(transferAmount.toString(), this.recipientAddress, '0x')
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
    })
  })

  describe('delegateCall', function () {
    beforeEach(async function () {
      await this.account.deploy()
    })

    it('should send delegateCall tx', async function () {
      await this.defaultSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther('1.0')
      })
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.encodeEthTransfer('0', '1', this.recipientAddress, transferAmount.toString())
      const tx = await this.account_ownerSigner.delegateCall(this.transferVerifier.address, transferEthData)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
    })
  })

  describe('metaDelegateCall', function () {
    beforeEach(async function () {
      this.transferAmt = ethers.utils.parseEther('1.0')
      await this.defaultSigner.sendTransaction({
        to: this.account.address,
        value: this.transferAmt
      })
    })

    it('should send tx for metaDelegateCall', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signEthTransfer(
        '0', '1', this.recipientAddress, this.transferAmt.toString(), MAX_UINT256
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(this.recipientAddress)).to.equal(ethers.utils.parseEther('1.0'))
    })
  })

  describe('metaPartialSignedDelegateCall', function () {
    it('should send tx for metaPartialSignedDelegateCall', async function () {
      await this.account.deploy()
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10', MAX_UINT256
      )
      const { signedData, unsignedData } = this.account.getLimitSwapData(signedEthToTokenSwap, randomAddress, '0x0123')
      await expect(this.account.metaPartialSignedDelegateCall(
        signedEthToTokenSwap.signedParams[0].value, signedData, signedEthToTokenSwap.signature, unsignedData
      ))
        .to.emit(this.account_limitSwapVerifier, 'EthToToken')
        .withArgs(
          '0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT256,
          ethers.utils.getAddress(randomAddress), '0x0123'
        )
    })
  })

  describe('isDeployed()', function () {
    it('should return true when contract is deployed', async function () {
      await this.account.deploy()
      expect(await this.account.isDeployed()).to.be.true
    })
  })
})