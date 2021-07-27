const { ethers } = require('hardhat')
const { randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const tokens = require('@brinkninja/environment/config/tokens.local1.json')
const { BN, constants, encodeFunctionCall } = require('@brinkninja/utils')
const { MAX_UINT256 } = constants
const Deployer = require('./helpers/Deployer')
const brinkSDK = require('../index')

beforeEach(async function () {
  const environment = {}
  const deployments = []

  // Singleton Factory
  const SingletonFactory = await ethers.getContractFactory('SingletonFactory')
  this.singletonFactory = await SingletonFactory.deploy()
  const singletonFactoryItem = {
    name: 'singletonFactory',
    contract: 'SingletonFactory',
    address: this.singletonFactory.address
  }

  // Create deployer
  this.deployer = new Deployer(this.singletonFactory)

  // Call executor 
  this.callExecutor = await this.deployer.deploy('CallExecutor', [], [])
  const callExecutorItem = {
    name: 'callExecutor',
    contract: 'CallExecutor',
    address: this.callExecutor.address
  }

  // Account contract
  this.accountContract = await this.deployer.deploy(
    'Account', ['address'], [this.callExecutor.address]
  )
  const accountContractItem = {
    name: 'account',
    contract: 'Account',
    address: this.accountContract.address
  }

  // Deploy and execute
  this.deployAndExecute = await this.deployer.deploy(
    'DeployAndExecute', 
    ['address', 'address'], 
    [this.singletonFactory.address, this.accountContract.address]
  )
  const deployAndExecuteItem = {
    name: 'deployAndExecute',
    contract: 'DeployAndExecute',
    address: this.deployAndExecute.address
  }

  // Transfer Verifier
  const TransferVerifier = await ethers.getContractFactory('TransferVerifier');
  this.transferVerifier = await TransferVerifier.deploy()
  const transferVerifierItem = {
    name: 'transferVerifier',
    contract: 'TransferVerifier',
    address: this.transferVerifier.address
  }

  // Limit Swap Verifier
  const LimitSwapVerifier = await ethers.getContractFactory('LimitSwapVerifierMock');
  this.limitSwapVerifier = await LimitSwapVerifier.deploy()
  const limitSwapVerifierItem = {
    name: 'limitSwapVerifier',
    contract: 'LimitSwapVerifier',
    address: this.limitSwapVerifier.address
  }

  // Cancel Verifier
  const CancelVerifier = await ethers.getContractFactory('CancelVerifier');
  this.cancelVerifier = await CancelVerifier.deploy()
  const cancelVerifierItem = {
    name: 'cancelVerifier',
    contract: 'CancelVerifier',
    address: this.cancelVerifier.address
  }

  deployments.push(
    singletonFactoryItem, 
    callExecutorItem, 
    accountContractItem, 
    deployAndExecuteItem,
    transferVerifierItem,
    limitSwapVerifierItem,
    cancelVerifierItem
  )

  environment.chainId = chainId
  environment.deployments = deployments
  environment.accountDeploymentSalt = randomHex(32)
  environment.accountVersion = '1'
  this.accountSalt = environment.accountDeploymentSalt
  this.chainId = chainId

  const signers = await ethers.getSigners()
  this.defaultSigner = signers[0]
  this.ethersAccountSigner = signers[1]

  const brink = brinkSDK({
    environment,
    ethers,
    signer: this.defaultSigner
  })

  this.ownerAddress = this.ethersAccountSigner.address

  // account uses ethers signer 0 (not the account owner, it's acting as an executor)
  this.account = brink.account(this.ownerAddress)

  // account_ownerSigner uses ethers signer 1 (this is the account owner, it can do direct or meta calls)
  this.account_ownerSigner = brink.account(this.ownerAddress, this.ethersAccountSigner)

  // accountSigner uses ethers signer 1 (it's acting as the owner of the Brink account)
  this.accountSigner = brink.accountSigner(this.ethersAccountSigner)

  this.token = await this.deployer.deploy(
    'TestERC20',
    ['string', 'string', 'uint8'],
    [tokens[0].name, tokens[0].symbol, tokens[0].decimals]
  )
  await this.token.mint(this.account.address, BN(10).pow(9).mul(BN(10).pow(tokens[0].decimals)))

  this.encodeEthTransfer = encodeEthTransfer
  this.encodeTokenTransfer = encodeTokenTransfer
})

async function encodeEthTransfer (
  bitmapIndex, bit, recipientAddress, amount, expiryBlock = MAX_UINT256
) {
  return encodeFunctionCall(
    'ethTransfer',
    [
      { name: 'bitmapIndex', type: 'uint256' },
      { name: 'bit', type: 'uint256'},
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256'},
      { name: 'expiryBlock', type: 'uint256'}
    ],
    [bitmapIndex, bit, recipientAddress, amount, expiryBlock.toString()]
  )
}

async function encodeTokenTransfer (
  bitmapIndex, bit, tokenAddress, recipientAddress, amount, expiryBlock = MAX_UINT256
) {
  return encodeFunctionCall(
    'tokenTransfer',
    [
      { name: 'bitmapIndex', type: 'uint256' },
      { name: 'bit', type: 'uint256'},
      { name: 'token', type: 'address'},
      { name: 'recipient', type: 'address' },
      { name: 'amount', type: 'uint256'},
      { name: 'expiryBlock', type: 'uint256'}
    ],
    [bitmapIndex, bit, tokenAddress, recipientAddress, amount, expiryBlock.toString()]
  )
}
