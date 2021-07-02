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

const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a121'
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
    // this.ownerAddress = signers[0].address
    this.deployer = new Deployer(singletonFactory)
    this.callExecutor = await this.deployer.deployAndLog('CallExecutor', [], [])
    this.accountContract = await this.deployer.deployAndLog(
      'Account', ['address'], [this.callExecutor.address]
    )
    this.deployAndExecute = await this.deployer.deployAndLog(
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

    this.account = new Account({
      implementationAddress:this.accountContract.address,
      ownerAddress: ownerAddress,
      accountVersion: '1',
      accountDeploymentSalt: this.accountSalt,
      chainId: chainId,
      ethers: ethers,
      ethersSigner: this.ethersSigner,
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
      await this.account.deploy()
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

  describe('metaDelegateCall', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deployAndLog(
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
      this.upgradedAccountContract = await this.deployer.deployAndLog(
        'Account', ['address'], [this.callExecutor.address]
      )
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

    it('Should return tx info for metaPartialSignedDelegateCall without account deployment', async function () {
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

    it('Should return tx info for metaPartialSignedDelegateCall with account deployment', async function () {
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, this.upgradedAccountContract.address
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      const { gasEstimate, contractName, functionName, paramTypes, params } = await this.account.transactionInfo('metaPartialSignedDelegateCall', [to, data, signature, '0x'])
      // expect(contractName).to.be.equal('DeployAndExecute')
      // expect(functionName).to.be.equal('deployAndExecute')
      // expect(parseInt(gasEstimate.toString())).to.be.closeTo(179000, 1000)
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