require('@openzeppelin/test-helpers') // for bignumber.equal chai behavior

const { ethers } = require('hardhat')
const { randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { Account, MessageEncoder, AccountSigner, PrivateKeySigner } = require('../src')
const computeAccountAddress = require('../src/computeAccountAddress')
const tokens = require('@brinkninja/environment/config/tokens.local1.json')
const BN = ethers.BigNumber.from


const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'


const { chaiSolidity } = require('@brinkninja/test-helpers')
const { expect } = chaiSolidity()

describe('AccountSigner', function () {
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
    
    this.token = await this.deployer.deploy(
      'TestERC20',
      ['string', 'string', 'uint8'],
      [tokens[0].name, tokens[0].symbol, tokens[0].decimals]
    )
    await this.token.mint(this.account.address, BN(10).pow(9).mul(BN(10).pow(tokens[0].decimals)))

  })

  describe('signCancel', function () {
    beforeEach(async function () {
      const CancelVerifier = await ethers.getContractFactory("CancelVerifier");
      this.cancelVerifier = await CancelVerifier.deploy()
    })

    it('Should call cancel through a signed metaDelegateCall', async function () {
      const signedCancelFnCall = await this.accountSigner.signCancel(
        this.cancelVerifier.address, '0', '1'
      )
      const to = signedCancelFnCall.signedParams[0].value
      const data = signedCancelFnCall.signedParams[1].value
      const signature = signedCancelFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })
  })
})