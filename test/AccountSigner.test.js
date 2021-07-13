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

const MAX_UINT_256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

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

  describe('CancelVerifier Signing', function () {
    beforeEach(async function () {
      const CancelVerifier = await ethers.getContractFactory("CancelVerifier");
      this.cancelVerifier = await CancelVerifier.deploy()
      this.accountWithEmits = CancelVerifier.attach(this.account.address)
    })

    it('Should call cancel through a signed metaDelegateCall', async function () {
      const signedCancelFnCall = await this.accountSigner.signCancel(
        this.cancelVerifier.address, '0', '1'
      )
      const to = signedCancelFnCall.signedParams[0].value
      const data = signedCancelFnCall.signedParams[1].value
      const signature = signedCancelFnCall.signature

      await expect(this.account.metaDelegateCall(to, data, signature))
        .to.emit(this.accountWithEmits, 'Cancelled')
        .withArgs('0', '1')
    })
  })

  describe('ProxyAdminVerifier Signing', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.proxyAdminVerifier = await ProxyAdminVerifier.deploy()
      this.accountWithEmits = ProxyAdminVerifier.attach(this.account.address)
    })

    it('Should call upgradeTo through a signed metaDelegateCall', async function () {
      const randomAddress = '0x13be228b8fc88ef382f0615f385b50690313a155'
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(
        this.proxyAdminVerifier.address, randomAddress
      )
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      await expect(this.account.metaDelegateCall(to, data, signature))
        .to.emit(this.accountWithEmits, 'Upgraded')
        .withArgs(ethers.utils.getAddress(randomAddress))
    })

    it('Should call setProxyOwner through a signed metaDelegateCall', async function () {
      const newOwner = '0x13be228b8fc88ef382f0615f385b50690313a177'
      const signedSetProxyOwnerFnCall = await this.accountSigner.signSetProxyOwner(
        this.proxyAdminVerifier.address, newOwner
      )
      const to = signedSetProxyOwnerFnCall.signedParams[0].value
      const data = signedSetProxyOwnerFnCall.signedParams[1].value
      const signature = signedSetProxyOwnerFnCall.signature
      
      await expect(this.account.metaDelegateCall(to, data, signature))
        .to.emit(this.accountWithEmits, 'ProxyOwnerChanged')
        .withArgs(ethers.utils.getAddress(newOwner))
    })
  })

  describe('Limit Swap Signing', function () {
    beforeEach(async function () {
      const LimitSwapVerifier = await ethers.getContractFactory("LimitSwapVerifierMock");
      this.limitSwapVerifier = await LimitSwapVerifier.deploy()
      this.messageEncoder = new MessageEncoder()
      this.accountWithEmits = LimitSwapVerifier.attach(this.account.address)
    })

    it('ethToToken swap', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        this.limitSwapVerifier.address, '0', '1', this.token.address, '10', '10', randomAddress, '0x123'
      )
      const to = signedEthToTokenSwap.signedParams[0].value
      const data = signedEthToTokenSwap.signedParams[1].value
      const signature = signedEthToTokenSwap.signature
      const unsignedData = {
        paramTypes: [
          { name: 'to', type: 'address' },
          { name: 'data', type: 'bytes'},
        ],
        params: [randomAddress, '0x123']
      }
      const unsignedDataEncoded = await this.messageEncoder.encodeParams(unsignedData)

      await expect(this.account.metaPartialSignedDelegateCall(to, data, signature, unsignedDataEncoded))
        .to.emit(this.accountWithEmits, 'EthToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToEth swap', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        this.limitSwapVerifier.address, '0', '1', this.token.address, '10', '10', randomAddress, '0x0123'
      )
      const to = signedEthToTokenSwap.signedParams[0].value
      const data = signedEthToTokenSwap.signedParams[1].value
      const signature = signedEthToTokenSwap.signature
      const unsignedData = {
        paramTypes: [
          { name: 'to', type: 'address' },
          { name: 'data', type: 'bytes'},
        ],
        params: [randomAddress, '0x0123']
      }
      const unsignedDataEncoded = await this.messageEncoder.encodeParams(unsignedData)
      
      await expect(this.account.metaPartialSignedDelegateCall(to, data, signature, unsignedDataEncoded))
        .to.emit(this.accountWithEmits, 'TokenToEth')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToToken swap', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        this.limitSwapVerifier.address, '0', '1', this.token.address, this.token.address, '10', '10', randomAddress, '0x0123'
      )
      const to = signedEthToTokenSwap.signedParams[0].value
      const data = signedEthToTokenSwap.signedParams[1].value
      const signature = signedEthToTokenSwap.signature
      const unsignedData = {
        paramTypes: [
          { name: 'to', type: 'address' },
          { name: 'data', type: 'bytes'},
        ],
        params: [randomAddress, '0x0123']
      }
      const unsignedDataEncoded = await this.messageEncoder.encodeParams(unsignedData)
      await expect(this.account.metaPartialSignedDelegateCall(to, data, signature, unsignedDataEncoded))
        .to.emit(this.accountWithEmits, 'TokenToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })
  })
})