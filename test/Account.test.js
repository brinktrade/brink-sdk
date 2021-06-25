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
    const deployer = new Deployer(singletonFactory)
    const callExecutor = await deployer.deployAndLog('CallExecutor', [], [])
    this.accountContract = await deployer.deployAndLog(
      'Account', 
      ['address', 'address', 'uint256'],
      [callExecutor.address, this.ethersSigner.address, chainId]
    )
    await this.accountContract.addExecutorWithoutSignature(this.ethersSigner.address)
    await this.accountContract.addExecutorWithoutSignature(ownerAddress)
    const deployAndExecute = await deployer.deployAndLog(
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

  describe.skip('deployAndTransfer', function () {
    describe('when signedFunctionCall is a valid transfer', function () {
      it.only('should execute the transfer', async function () {
        await this.account.loadFromParams(this.accountContract.address, ownerAddress)

        // const ethAmount = BN(0.01 * 10**18)
        const ethAmount = ethers.utils.parseEther('0.1');
        // this.expectedRecipientBalance = BN(await ethers.provider.getBalance(recipientAddress)).add(ethAmount)
        await this.ethersSigner.sendTransaction({
          to: this.accountSigner.accountAddress,
          value: ethAmount
        })
  
        const bitData = await this.account.nextBit()
        const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethers.utils.parseEther('0.01'))
        console.log(signedTransferEthCall)
        
        console.log(await ethers.provider.getBalance(this.accountSigner.accountAddress))
        const response = await this.account.deployAndTransfer(signedTransferEthCall)

        console.log(response)
        // expect ETH to be transferred to recipientAddress
        console.log(await ethers.provider.getBalance(this.accountSigner.accountAddress))
        console.log(await ethers.provider.getBalance(recipientAddress))
        // expect(await ethers.provider.getBalance(this.accountSigner.accountAddress)).to.be.equal(ethers.utils.parseEther('0'))
        // expect(await ethers.provider.getBalance(recipientAddress)).to.be.equal(ethAmount)
      })
    })

    // describe('when signed call is an ETH transfer and account does not have enough ETH', function () {
    //   it('should throw an error', async function () {
    //     await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
    //     const ethAmount = BN(0.01 * 10**18)
    //     const bitData = await this.account.nextBit()
    //     const signedTransferEthCall = await this.accountSigner.signTransferEth(bitData, recipientAddress, ethAmount)
    //     await expectAsyncError(
    //       this.account.deployAndTransfer(signedTransferEthCall),
    //       `Can't transferEth. Account has 0 but needs ${ethAmount}`
    //     )
    //   })
    // })

    // describe('when signed call is a token transfer and account does not have enough token', function () {
    //   it('should throw an error', async function () {
    //     const token = await TestERC20.new('TestToken', 'TT', 18)
    //     await this.account.loadFromParams(this.accountLogic.address, ownerAddress)
    //     const tokenAmount = BN(0.01 * 10**18)
  
    //     const bitData = await this.account.nextBit()
    //     const signedTransferTokenCall = await this.accountSigner.signTransferToken(
    //       bitData, token.address, recipientAddress, tokenAmount
    //     )
    //     await expectAsyncError(
    //       this.account.deployAndTransfer(signedTransferTokenCall),
    //       `Can't transfer token. Account has 0 but needs ${tokenAmount.toString()}`
    //     )
    //   })
    // })
  })
})