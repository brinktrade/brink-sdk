require('@openzeppelin/test-helpers') // for bignumber.equal chai behavior

const { ethers } = require('hardhat')
const { randomHex } = require('web3-utils')
const { chainId } = require('@brinkninja/environment/config/network.config.local1.json')
const Deployer = require('./helpers/Deployer')
const { Account, MessageEncoder, AccountSigner, PrivateKeySigner, BrinkSDK } = require('../src')
const computeAccountAddress = require('../src/computeAccountAddress')
const tokens = require('@brinkninja/environment/config/tokens.local1.json')
const BN = ethers.BigNumber.from


const ownerAddress = '0x6ede982a4e7feb090c28a357401d8f3a6fcc0829'
const ownerPrivateKey = '0x4497d1a8deb6a0b13cc85805b6392331623dd2d429db1a1cad4af2b57fcdec25'

const brinkUtils = require('@brinkninja/utils')
const {
  MAX_UINT_256
} = brinkUtils.test
const { chaiSolidity } = require('@brinkninja/test-helpers')
const { expect } = chaiSolidity()

describe('AccountSigner', function () {
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

    const brinkSDK = new BrinkSDK(environmentConfiguration)

    const signers = await ethers.getSigners()
    this.ethersSigner = signers[0]
    this.accountSalt = randomHex(32)

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

    const { account, accountSigner } = brinkSDK.newAccount(this.ownerSigner, privateKeySigner, this.accountSalt, ethers)
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

  describe('CancelVerifier Signing', function () {
    it('Should call cancel through a signed metaDelegateCall', async function () {
      const signedCancelFnCall = await this.accountSigner.signCancel('0', '1')
      const to = signedCancelFnCall.signedParams[0].value
      const data = signedCancelFnCall.signedParams[1].value
      const signature = signedCancelFnCall.signature
      const tx = this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
      await expect(this.account.metaDelegateCall(to, data, signature))
        .to.be.reverted
    })
  })

  describe('ProxyAdminVerifier Signing', function () {
    beforeEach(async function () {
      const ProxyAdminVerifier = await ethers.getContractFactory("ProxyAdminVerifier");
      this.accountWithEmits = ProxyAdminVerifier.attach(this.account.address)
    })

    it('Should call upgradeTo through a signed metaDelegateCall', async function () {
      const randomAddress = '0x13be228b8fc88ef382f0615f385b50690313a155'
      const signedUpgradeFnCall = await this.accountSigner.signUpgrade(randomAddress)
      const to = signedUpgradeFnCall.signedParams[0].value
      const data = signedUpgradeFnCall.signedParams[1].value
      const signature = signedUpgradeFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })

    it('Should call setProxyOwner through a signed metaDelegateCall', async function () {
      const newOwner = '0x13be228b8fc88ef382f0615f385b50690313a177'
      const signedSetProxyOwnerFnCall = await this.accountSigner.signSetProxyOwner(newOwner)
      const to = signedSetProxyOwnerFnCall.signedParams[0].value
      const data = signedSetProxyOwnerFnCall.signedParams[1].value
      const signature = signedSetProxyOwnerFnCall.signature
      
      const tx = await this.account.metaDelegateCall(to, data, signature)
      expect(tx).to.not.be.undefined
    })
  })

  describe('Limit Swap Signing', function () {
    beforeEach(async function () {
      const LimitSwapVerifier = await ethers.getContractFactory("LimitSwapVerifierMock");
      this.messageEncoder = new MessageEncoder()
      this.accountWithEmits = LimitSwapVerifier.attach(this.account.address)
    })

    it('ethToToken swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10', randomAddress, '0x123'
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

    it('ethToToken swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signEthToTokenSwap(
        '0', '1', this.token.address, '10', '10', randomAddress, '0x123'
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

    it('tokenToEth swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        '0', '1', this.token.address, '10', '10', randomAddress, '0x0123'
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

    it('tokenToEth swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToEthSwap(
        '0', '1', this.token.address, '10', '10', randomAddress, '0x0123'
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

    it.only('tokenToToken swap (without account deployment)', async function () {
      await this.account.deploy()
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        '0', '1', this.token.address, this.token.address, '10', '10'
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
      console.log('TO', to)
      console.log('DATA', data)
      console.log('SIGNATURE', signature)
      console.log("UNSIGNED", unsignedDataEncoded)
      await expect(this.account.metaPartialSignedDelegateCall(to, data, signature, unsignedDataEncoded))
        .to.emit(this.accountWithEmits, 'TokenToToken')
        .withArgs('0', '1', ethers.utils.getAddress(this.token.address), ethers.utils.getAddress(this.token.address), '10', '10', MAX_UINT_256, ethers.utils.getAddress(randomAddress), '0x0123')
    })

    it('tokenToToken swap (with account deployment)', async function () {
      const randomAddress = '0x13be228b8fc66ef382f0615f385b50710313a188'
      const signedEthToTokenSwap = await this.accountSigner.signTokenToTokenSwap(
        '0', '1', this.token.address, this.token.address, '10', '10', randomAddress, '0x0123'
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