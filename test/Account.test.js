const { ethers } = require('hardhat')
const { expect } = require('chai')
const { toBN: BN, utf8ToHex, randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { Account } = require('../src')
const deployAccount = require('./helpers/deployAccount')
const expectAsyncError = require('./helpers/expectAsyncError')

describe('Account with PrivateKeySigner', function () {
  beforeEach(async function () {
    const SingletonFactory = await ethers.getContractFactory('SingletonFactory')
    const singletonFactory = await SingletonFactory.deploy()
    this.singletonFactory = singletonFactory
    const signers = await ethers.getSigners()
    const ethersSigner = signers[0]
    this.accountSalt = randomHex(32)
    this.ownerAddress = signers[0].address
    const deployer = new Deployer(singletonFactory)
    const callExecutor = await deployer.deployAndLog('CallExecutor', [], [])
    this.accountContract = await deployer.deployAndLog(
      'Account', 
      ['address', 'address', 'uint256'],
      [callExecutor.address, ethersSigner.address, chainId]
    )
    const deployAndExecute = await deployer.deployAndLog(
      'DeployAndExecute', 
      ['address', 'address'], 
      [singletonFactory.address, this.accountContract.address]
    )

    this.account = new Account({
      accountVersion: '1',
      accountDeploymentSalt: this.accountSalt,
      chainId: chainId,
      ethersProvider: ethers,
      ethersSigner: ethersSigner,
      deployerAddress: singletonFactory.address,
      deployAndExecuteAddress: deployAndExecute.address
    })
    
  })

  describe('loadFromParams()', function () {
    describe('when contract code is not deployed', function () {
      it('should return false from isDeployed()', async function () {
        await this.account.loadFromParams(this.accountContract.address, this.ownerAddress)
        expect(await this.account.isDeployed()).to.be.false
      })
    })
  })

  describe('when contract code is deployed', function () {
    it('should return true from isDeployed()', async function () {
      await this.account.loadFromParams(this.accountContract.address, this.ownerAddress)
      await this.account.deploy()
      expect(await this.account.isDeployed()).to.be.true
    })
  })

  describe('loadFromAddress()', function () {
    describe('when address is an Account contract', function () {
      it('should not throw an error', async function () {
        await this.account.loadFromParams(this.accountContract.address, this.ownerAddress)
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
          this.ownerAddress,
          this.accountSalt,
          chainId
        )
        await expectAsyncError(this.account.loadFromAddress(accountAddress))
      })
    })
  })
})