require('@openzeppelin/test-helpers') // for bignumber.equal chai behavior

const { ethers } = require('hardhat')
const { expect } = require('chai')
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
    const deployAndExecute = await this.deployer.deployAndLog(
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
      accountVersion: '1',
      accountDeploymentSalt: this.accountSalt,
      chainId: chainId,
      ethers: ethers,
      ethersSigner: this.ethersSigner,
      deployerAddress: singletonFactory.address,
      deployAndExecuteAddress: deployAndExecute.address
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

  describe('loadFromParams()', function () {
    describe('when contract code is not deployed', function () {
      it('should return false from isDeployed()', async function () {
        await this.account.loadFromParams(this.accountContract.address, ownerAddress)
        expect(await this.account.isDeployed()).to.be.false
      })
    })
  })

  describe('when contract code is deployed', function () {
    it('should return true from isDeployed()', async function () {
      await this.account.loadFromParams(this.accountContract.address, ownerAddress)
      await this.account.deploy()
      expect(await this.account.isDeployed()).to.be.true
    })
  })

  describe('loadFromAddress()', function () {
    describe('when address is an Account contract', function () {
      it('should not throw an error', async function () {
        await this.account.loadFromParams(this.accountContract.address, ownerAddress)
        await this.account.deploy()
        await this.account.loadFromAddress(this.accountContract.address)
      })
    })

    describe('when address is not a valid Account contract', function () {
      it('should throw an error', async function () {
        // set a different deployerAddress so computed addresses won't match
        this.account._deployerAddress = '0x7bf9e48a063f9835d140146e38841682abb85040'
        const accountAddress = await deployAccount(
          this.singletonFactory, 
          this.accountContract.address, 
          ownerAddress,
          this.accountSalt,
          chainId
        )
        await expectAsyncError(this.account.loadFromAddress(accountAddress))
      })
    })
  })

  describe('deploy', function () {
    describe('when given valid params', function () {
      beforeEach(async function () {
        await this.account.loadAndDeploy(this.accountContract.address, ownerAddress)
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

  describe('upgrade', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
      const CallExecutor = await ethers.getContractFactory("CallExecutor");
      this.callExecutor = await CallExecutor.deploy()
      this.upgradedAccountContract = await this.deployer.deployAndLog(
        'Account', 
        ['address', 'address', 'uint256'],
        [this.callExecutor.address, this.ethersSigner.address, chainId]
      )
      // await this.account.loadAndDeploy(this.accountContract.address, ownerAddress)
      await this.account.loadFromParams(this.accountContract.address, ownerAddress)
    })

    it.only('should upgrade the account implementation', async function () {
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