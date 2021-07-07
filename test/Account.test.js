require('@openzeppelin/test-helpers') // for bignumber.equal chai behavior

const { ethers } = require('hardhat')
// const { expect } = require('chai')
const { toBN: BN, utf8ToHex, randomHex } = require('web3-utils')
const { web3 } = require('@openzeppelin/test-environment')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { Account, AccountSigner, PrivateKeySigner } = require('../src')
const deployAccount = require('./helpers/deployAccount')
const expectAsyncError = require('./helpers/expectAsyncError')
const computeAccountAddress = require('../src/computeAccountAddress')

const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

const { chaiSolidity } = require('@brinkninja/test-helpers')
const { expect } = chaiSolidity()

describe('Account with PrivateKeySigner', function () {
  beforeEach(async function () {
    const SingletonFactory = await ethers.getContractFactory('SingletonFactory')
    const singletonFactory = await SingletonFactory.deploy()
    this.singletonFactory = singletonFactory
    const signers = await ethers.getSigners()
    this.ethersSigner = signers[0]
    this.accountSalt = randomHex(32)
    this.deployer = new Deployer(singletonFactory)
    this.callExecutor = await this.deployer.deploy('CallExecutor', [], [])
    this.accountContract = await this.deployer.deploy(
      'Account', ['address'], [this.callExecutor.address]
    )
    this.deployAndExecute = await this.deployer.deploy(
      'DeployAndExecute', 
      ['address', 'address'], 
      [singletonFactory.address, this.accountContract.address]
    )

    const privateKeySigner = new PrivateKeySigner(ownerPrivateKey)
    this.accountSigner = new AccountSigner({
      accountVersion: '1',
      chainId,
      signer: privateKeySigner
    })

    this.accountSigner.initFromParams(
      this.singletonFactory.address,
      this.accountContract.address,
      chainId,
      this.accountSalt
    )

    await this.ethersSigner.sendTransaction({
      to: ownerAddress,
      value: ethers.utils.parseEther("500.0")
    });
    
    // this.ownerSigner = ethers.getSigner(ownerAddress)
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x6ede982a4e7feb090c28a357401d8f3a6fcc0829"]}
    )
    this.ownerSigner = await ethers.getSigner("0x6ede982a4e7feb090c28a357401d8f3a6fcc0829")
    // await hre.network.provider.request({
    //   method: "hardhat_stopImpersonatingAccount",
    //   params: ["0x6ede982a4e7feb090c28a357401d8f3a6fcc0829"]}
    // )

    this.account = new Account({
      implementationAddress: this.accountContract.address,
      ownerAddress: ownerAddress,
      accountVersion: '1',
      accountDeploymentSalt: this.accountSalt,
      chainId: chainId,
      ethers: ethers,
      ethersSigner: this.ownerSigner,
      deployerAddress: singletonFactory.address,
      deployAndExecuteAddress: this.deployAndExecute.address
    })

    this.accountSigner = new AccountSigner({
      accountVersion: '1',
      chainId,
      signer: privateKeySigner
    })
    this.accountSigner.initFromParams(
      this.singletonFactory.address,
      this.accountContract.address,
      chainId,
      this.accountSalt
    )
    
  })

  describe('when contract code is deployed', function () {
    it('should return true from isDeployed()', async function () {
      let resp = await this.account.deploy()
      expect(await this.account.isDeployed()).to.be.true
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
          chainId,
          this.accountSalt
        )
        expect(this.account.address).to.equal(expectedAccountAddress)
      })
    })
  })

  describe('delegateCall', function () {
    beforeEach(async function () {
      const TransferVerifier = await ethers.getContractFactory("TransferVerifier");
      this.transferVerifier = await TransferVerifier.deploy()
      await this.account.deploy()
    })

    it('Should complete an ETH transfer with delegateCall', async function () {
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a121'
      await this.ethersSigner.sendTransaction({
        to: this.account.address,
        value: ethers.utils.parseEther("1.0")
      });
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.accountSigner.encodeTransferEth(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), recipientAddress, transferAmount.toString())
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
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deploy(
        'Account', ['address'], [this.callExecutor.address]
      )
    })

    it('Should return completed tx for metaDelegateCall with account deployment', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })

    it('Should return completed tx for metaDelegateCall without account deployment', async function () {
      await this.account.deploy()
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })
  })

  describe('transactionInfo', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deploy(
        'Account', ['address'], [this.callExecutor.address]
      )
    })

    it('Should return tx info for delegateCall eth transfer', async function () {
      await this.account.deploy()
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a123'
      const transferAmount = await ethers.utils.parseEther('0.01')
      const transferEthData = await this.accountSigner.encodeTransferEth(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), recipientAddress, transferAmount.toString())

      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('delegateCall', [recipientAddress, transferEthData])
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(33750, 1000)
    })

    // TODO: figure out why gas estimation fails for this successful tx
    it.skip('Should return tx info for externalCall eth transfer', async function () {
      await this.account.deploy()
      const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a124'
      const transferAmount = await ethers.utils.parseEther('0.01')

      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('externalCall', [transferAmount.toString(), recipientAddress, '0x'])
      console.log('GAS: ', gasEstimate.toString())
      // expect(parseInt(gasEstimate.toString())).to.be.closeTo(33946, 1000)
    })

    it('Should return tx info for metaDelegateCall with account deployment', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaDelegateCall', [to, data, signature])
      expect(contractName).to.be.equal('DeployAndExecute')
      expect(functionName).to.be.equal('deployAndExecute')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(179000, 1000)
    })

    it('Should return tx info for metaDelegateCall without account deployment', async function () {
      await this.account.deploy()
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaDelegateCall', [to, data, signature])
      expect(contractName).to.be.equal('Account')
      expect(functionName).to.be.equal('metaDelegateCall')
      expect(parseInt(gasEstimate.toString())).to.be.closeTo(45241, 1000)
    })

    it.skip('Should return tx info for metaPartialSignedDelegateCall without account deployment', async function () {
      await this.account.deploy()
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      this.account.metaPartialSignedDelegateCall(to, data, signature, '0x')
      // const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaPartialSignedDelegateCall', [to, data, signature, '0x'])
      // console.log('GAS: ', gasEstimate.toString())
      // console.log('CONTRACT: ', contractName)
      // console.log('FUNCTION NAME: ', functionName)
      // console.log('PARAM TYPES: ', paramTypes)
      // console.log('PARAMS: ', params)

      // expect(contractName).to.be.equal('Account')
      // expect(functionName).to.be.equal('metaDelegateCall')
      // expect(parseInt(gasEstimate.toString())).to.be.closeTo(45241, 1000)
    })

    it.skip('Should return tx info for metaPartialSignedDelegateCall with account deployment', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      this.account.metaPartialSignedDelegateCall(to, data, signature, '0x')
      // const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaPartialSignedDelegateCall', [to, data, signature, '0x'])
      // expect(contractName).to.be.equal('DeployAndExecute')
      // expect(functionName).to.be.equal('deployAndExecute')
      // expect(parseInt(gasEstimate.toString())).to.be.closeTo(179000, 1000)
    })
  })

  describe.skip('upgrade', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deployAndLog(
        'Account', ['address'], [this.callExecutor.address]
      )
      const tx = await this.account.metaDelegateCall(to, data, signature)
      console.log('TX: ', tx)
    })

    it('should upgrade the account implementation', async function () {
      // expect(await this.account.implementation()).to.equal(this.accountContract.address)
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      console.log('TX: ', tx)

      // const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaDelegateCall', [to, data, signature])
      // console.log('GAS: ', gasEstimate.toString())
      // console.log('CONTRACT: ', contractName)
      // console.log('FUNCTION NAME: ', functionName)
      // console.log('PARAM TYPES: ', paramTypes)
      // console.log('PARAMS: ', params)

      // const promiEvent = await this.account.upgrade(signedUpgradeFnCall)
      // await new Promise(resolve => promiEvent.onReceipt(resolve))
      // expect(await this.account.implementation()).to.equal(this.upgradedAccountContract.address)
    })
  })
})