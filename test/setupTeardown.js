const { ethers } = require('hardhat')
const { randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { MessageEncoder, PrivateKeySigner, BrinkSDK } = require('../src')
const tokens = require('@brinkninja/environment/config/tokens.local1.json')
const BN = ethers.BigNumber.from

const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

beforeEach(async function () {
  const environmentConfiguration = {}
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
  const TransferVerifier = await ethers.getContractFactory("TransferVerifier");
  this.transferVerifier = await TransferVerifier.deploy()
  const transferVerifierItem = {
    name: 'transferVerifier',
    contract: 'TransferVerifier',
    address: this.transferVerifier.address
  }

  // Proxy Admin Verifier
  const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
  this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
  const proxyAdminVerifierItem = {
    name: 'proxyAdminVerifier',
    contract: 'ProxyAdminVerifier',
    address: this.proxyAdminVerifier.address
  }

  // Limit Swap Verifier
  const LimitSwapVerifier = await ethers.getContractFactory("LimitSwapVerifierMock");
  this.limitSwapVerifier = await LimitSwapVerifier.deploy()
  const limitSwapVerifierItem = {
    name: 'limitSwapVerifier',
    contract: 'LimitSwapVerifier',
    address: this.limitSwapVerifier.address
  }

  // Cancel Verifier
  const CancelVerifier = await ethers.getContractFactory("CancelVerifier");
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
    proxyAdminVerifierItem,
    limitSwapVerifierItem,
    cancelVerifierItem
  )

  environmentConfiguration.chainId = chainId
  environmentConfiguration.deployments = deployments
  environmentConfiguration.accountDeploymentSalt = randomHex(32)
  environmentConfiguration.accountVersion = '1'
  this.accountSalt = environmentConfiguration.accountDeploymentSalt
  this.chainId = chainId

  const brinkSDK = new BrinkSDK(environmentConfiguration)

  const signers = await ethers.getSigners()
  this.ethersSigner = signers[0]

  await this.ethersSigner.sendTransaction({
    to: ownerAddress,
    value: ethers.utils.parseEther("500.0")
  });
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: ["0x6ede982a4e7feb090c28a357401d8f3a6fcc0829"]}
  )
  this.ownerSigner = await ethers.getSigner("0x6ede982a4e7feb090c28a357401d8f3a6fcc0829")
  const privateKeySigner = new PrivateKeySigner(ownerPrivateKey)

  const { account, accountSigner } = brinkSDK.newAccount(this.ownerSigner, privateKeySigner, ethers)
  this.account = account
  this.accountSigner = accountSigner
  this.messageEncoder = new MessageEncoder()

  this.token = await this.deployer.deploy(
    'TestERC20',
    ['string', 'string', 'uint8'],
    [tokens[0].name, tokens[0].symbol, tokens[0].decimals]
  )
  await this.token.mint(this.account.address, BN(10).pow(9).mul(BN(10).pow(tokens[0].decimals)))

})