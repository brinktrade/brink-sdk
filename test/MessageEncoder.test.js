require('@openzeppelin/test-helpers') // for bignumber.equal chai behavior

const { ethers } = require('hardhat')
const { randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { Account, MessageEncoder } = require('../src')
const computeAccountAddress = require('../src/computeAccountAddress')
const tokens = require('@brinkninja/environment/config/tokens.local1.json')
const BN = ethers.BigNumber.from


const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'

const { chaiSolidity } = require('@brinkninja/test-helpers')
const { expect } = chaiSolidity()

describe('MessageEncoder', function () {
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
    await this.ethersSigner.sendTransaction({
      to: ownerAddress,
      value: ethers.utils.parseEther("500.0")
    });
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: ["0x6ede982a4e7feb090c28a357401d8f3a6fcc0829"]}
    )
    this.ownerSigner = await ethers.getSigner("0x6ede982a4e7feb090c28a357401d8f3a6fcc0829")
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
    this.messageEncoder = new MessageEncoder()
    
    this.token = await this.deployer.deploy(
      'TestERC20',
      ['string', 'string', 'uint8'],
      [tokens[0].name, tokens[0].symbol, tokens[0].decimals]
    )
    await this.token.mint(this.account.address, BN(10).pow(9).mul(BN(10).pow(tokens[0].decimals)))

    await this.account.deploy()
    const TransferVerifier = await ethers.getContractFactory("TransferVerifier");
    this.transferVerifier = await TransferVerifier.deploy()
  })

  it('Should complete an ETH transfer with delegateCall using encodeTransferEth', async function () {
    const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a155'
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

  it('Should complete a Token transfer with delegateCall using encodeTransferToken', async function () {
    const recipientAddress = '0x17be668e8fc88ef382f0615f385b50690313a155'
    const transferTokenData = await this.messageEncoder.encodeTransferToken(ethers.BigNumber.from(0).toString(), ethers.BigNumber.from(1).toString(), this.token.address, recipientAddress, '10')
    const tx = await this.account.delegateCall(this.transferVerifier.address, transferTokenData)
    expect(tx).to.not.be.undefined
    expect(await this.token.balanceOf(recipientAddress)).to.equal('10')
  })
})