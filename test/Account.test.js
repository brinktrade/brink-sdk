const { ethers } = require('hardhat')
const chaiAsPromised = require('chai-as-promised')
const brinkUtils = require('@brinkninja/utils')
const computeAccountAddress = require('../src/computeAccountAddress')

const { chaiSolidity, MAX_UINT_256 } = brinkUtils.test
const chai = chaiSolidity()
chai.use(chaiAsPromised)
const { expect } = chai

const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'
const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'

describe('Account', function () {

  beforeEach(async function () {
    const LimitSwapVerifier = await ethers.getContractFactory('LimitSwapVerifierMock')
    this.account_limitSwapVerifier = LimitSwapVerifier.attach(this.account.address)
  })

  describe('populateTransaction', function () {
    it('should wrap call to ethers populateTranscation', async function () {
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      const res = await this.account.populateTransaction.sendLimitSwap(signedEthToTokenSwap, randomAddress, '0x0123')
      const { contract, contractName, functionName, params, paramTypes, data, to, from } = res
      expect(contract).not.to.be.undefined
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
      expect(res.gas.toString()).to.be.bignumber.greaterThan('0')
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
          '0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256,
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
          ownerAddress,
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

  describe('isDeployed()', function () {
    it('should return true when contract is deployed', async function () {
      await this.account.deploy()
      expect(await this.account.isDeployed()).to.be.true
    })
  })

  describe('delegateCall', function () {
    beforeEach(async function () {
      await this.account.deploy()
    })

    it('Should complete an ETH transfer with delegateCall', async function () {
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a121'
      await this.ethersSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther("1.0")
      });
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.messageEncoder.encodeTransferEth(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), recipientAddress, transferAmount.toString())
      const tx = await this.account.delegateCall(this.transferVerifier.address, transferEthData)
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
    })
  })

  describe('externalCall', function () {
    beforeEach(async function () {
      await this.account.deploy()
    })

    it('Should complete an ETH transfer with externalCall', async function () {
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a122'
      await this.ethersSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther("1.0")
      });
      const transferAmount = await ethers.utils.parseEther('0.01')
      const tx = await this.account.externalCall(transferAmount.toString(), recipientAddress, '0x')
      expect(tx).to.not.be.undefined
      expect(await ethers.provider.getBalance(recipientAddress)).to.equal(ethers.utils.parseEther('0.01'))
    })
  })

  describe('metaDelegateCall', function () {
    beforeEach(async function () {
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deploy(
        'Account', ['address'], [this.callExecutor.address]
      )
    })

    it('Should return completed tx for metaDelegateCall with account deployment', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(this.upgradedAccountContract.address)
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })

    it('Should return completed tx for metaDelegateCall without account deployment', async function () {
      await this.account.deploy()
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(this.upgradedAccountContract.address)
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })
  })

  describe('transactionInfo', function () {
    beforeEach(async function () {
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deploy(
        'Account', ['address'], [this.callExecutor.address]
      )
    })

    it('Should return tx info for metaDelegateCall with account deployment', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(this.upgradedAccountContract.address)
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaDelegateCall', [to, data, signature])
      expect(contractName).to.be.equal('DeployAndExecute')
      expect(functionName).to.be.equal('deployAndExecute')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(179000, 2000)
    })

    it('Should return tx info for metaDelegateCall without account deployment', async function () {
      await this.account.deploy()
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(this.upgradedAccountContract.address)
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaDelegateCall', [to, data, signature])
      expect(contractName).to.be.equal('Account')
      expect(functionName).to.be.equal('metaDelegateCall')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(45241, 2000)
    })

    it('Should return tx info for delegateCall eth transfer', async function () {
      await this.account.deploy()
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a123'
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.messageEncoder.encodeTransferEth(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), recipientAddress, transferAmount.toString())

      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('delegateCall', [recipientAddress, transferEthData])
      expect(contractName).to.be.equal('Account')
      expect(functionName).to.be.equal('delegateCall')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(33750, 1000)
    })

    it('Should return tx info for externalCall eth transfer', async function () {
      await this.ethersSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther("0.01")
      });
      await this.account.deploy()
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a124'
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.messageEncoder.encodeTransferEth(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), recipientAddress, transferAmount.toString())

      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('externalCall', [transferAmount.toString(), recipientAddress, '0x'])
      expect(contractName).to.be.equal('Account')
      expect(functionName).to.be.equal('externalCall')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(66839, 1000)
    })

    it('Should return tx info for metaPartialSignedDelegateCall without account deployment', async function () {
      await this.account.deploy()
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      const { signedData, unsignedData } = this.account.getLimitSwapData(signedEthToTokenSwap, randomAddress, '0x0123')
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaPartialSignedDelegateCall', [signedEthToTokenSwap.signedParams[0].value, signedData, signedEthToTokenSwap.signature, unsignedData])
      expect(contractName).to.be.equal('Account')
      expect(functionName).to.be.equal('metaPartialSignedDelegateCall')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(50000, 1000)
    })

    it('Should return tx info for metaPartialSignedDelegateCall with account deployment', async function () {
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10'
      )
      const { signedData, unsignedData } = this.account.getLimitSwapData(signedEthToTokenSwap, randomAddress, '0x0123')
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaPartialSignedDelegateCall', [signedEthToTokenSwap.signedParams[0].value, signedData, signedEthToTokenSwap.signature, unsignedData])
      expect(contractName).to.be.equal('DeployAndExecute')
      expect(functionName).to.be.equal('deployAndExecute')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(187000, 1000)
    })
  })
})