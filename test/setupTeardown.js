const { ethers } = require('hardhat')
const tokens = require('@brinkninja/environment/config/tokens.local1.json')
const deploySaltedContract = require('@brinkninja/core/test/helpers/deploySaltedContract')
const { CALL_EXECUTOR } = require('@brinkninja/verifiers/constants')
const { BN, constants, encodeFunctionCall } = require('@brinkninja/utils')
const { MAX_UINT256 } = constants
const brinkSDK = require('../index')
const randomSigner = require('./helpers/randomSigner')

beforeEach(async function () {
  this.accountContract = await deploySaltedContract('Account')
  this.accountFactory = await deploySaltedContract('AccountFactory')
  this.deployAndCall = await deploySaltedContract('DeployAndCall')
  this.callExecutor = await deploySaltedContract('CallExecutor')
  this.limitSwapVerifier = await deploySaltedContract('LimitSwapVerifier', ['address'], [CALL_EXECUTOR])
  this.transferVerifier = await deploySaltedContract('TransferVerifier')
  this.cancelVerifier = await deploySaltedContract('CancelVerifier')

  const signers = await ethers.getSigners()
  this.defaultSigner = signers[0]

  const brink = brinkSDK()

  this.ethersAccountSigner = await randomSigner()
  this.ownerAddress = this.ethersAccountSigner.address

  // account uses ethers signer 0 (not the account owner, it's acting as an executor)
  this.account = brink.account(this.ownerAddress, {
    provider: ethers.provider,
    signer: this.defaultSigner
  })

  // account_ownerSigner uses ethers signer 1 (this is the account owner, it can do direct or meta calls)
  this.account_ownerSigner = brink.account(this.ownerAddress, {
    provider: ethers.provider,
    signer: this.ethersAccountSigner
  })

  const Account = await ethers.getContractFactory('Account')
  this.proxyAccountContract = await Account.attach(this.account.address)

  const MockAccountBits = await ethers.getContractFactory('MockAccountBits')
  this.mockAccountBits = await MockAccountBits.deploy()

  // accountSigner uses ethers signer 1 (it's acting as the owner of the Brink account)
  this.accountSigner = brink.accountSigner(this.ethersAccountSigner, 'hardhat')

  this.token = await deploySaltedContract(
    'TestERC20',
    ['string', 'string', 'uint8'],
    ['TestToken', 'TKN', 18]
  )
  const tknDefaultBal = BN(10).pow(9).mul(BN(10).pow(18))
  await this.token.mint(this.account.address, tknDefaultBal)

  this.token2 = await deploySaltedContract(
    'TestERC20',
    ['string', 'string', 'uint8'],
    ['TestToken_2', 'TKN2', 18]
  )
  await this.token2.mint(this.account.address, tknDefaultBal)

  // TestFulfillSwap is like a mock AMM, fill it with token and ETH to fulfill swaps
  this.testFulfillSwap = await deploySaltedContract('TestFulfillSwap')
  await this.token.mint(this.testFulfillSwap.address, tknDefaultBal)
  await this.token2.mint(this.testFulfillSwap.address, tknDefaultBal)
  await this.defaultSigner.sendTransaction({
    to: this.testFulfillSwap.address,
    value: ethers.BigNumber.from('10000000000000000000000000')
  })

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
