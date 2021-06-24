const { ethers } = require('hardhat')
const { expect } = require('chai')
const { toBN: BN, utf8ToHex, randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { Account } = require('../src')

describe('Account with PrivateKeySigner', function () {
  beforeEach(async function () {
    const SingletonFactory = await ethers.getContractFactory('SingletonFactory')
    const singletonFactory = await SingletonFactory.deploy()
    const signers = await ethers.getSigners()
    const ethersSigner = signers[0]
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
      accountDeploymentSalt: randomHex(32),
      chainId: chainId,
      ethersProvider: ethers,
      ethersSigner: ethersSigner,
      deployerAddress: singletonFactory.address,
      deployAndExecuteAddress: deployAndExecute.address
    })
    
  })

  it.only('Deploys the proxy contract', async function () {
    await this.account.loadFromParams(this.accountContract.address, this.ownerAddress)
    await this.account.deploy()
    expect(await this.account.isDeployed()).to.be.true
  })
})