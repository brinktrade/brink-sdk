require('@nomiclabs/hardhat-ethers')
const _ = require('lodash')
const { ethers } = require('hardhat')
const deploySaltedContract = require('@brinkninja/core/test/helpers/deploySaltedContract')
const { BN, constants, encodeFunctionCall } = require('@brinkninja/utils')
const { MAX_UINT256 } = constants
// const brink = require('@brink-sdk').default
const randomSigner = require('../helpers/randomSigner')
const mockLedgerSignerBadV = require('../helpers/mockLedgerSignerBadV')
const { accountFromOwner } = require('@brink-sdk')

beforeEach(async function () {
  this.accountContract = await deploySaltedContract('Account')
  this.accountFactory = await deploySaltedContract('AccountFactory')
  this.deployAndCall = await deploySaltedContract('DeployAndCall')
  this.transferVerifier = await deploySaltedContract('TransferVerifier')
  this.cancelVerifier = await deploySaltedContract('CancelVerifier')
  this.callExecutorV2 = await deploySaltedContract('CallExecutorV2')
  this.approvalSwapsV1 = await deploySaltedContract('ApprovalSwapsV1')

  const signers = await ethers.getSigners()
  this.defaultSigner = signers[0]

  this.ethersAccountSigner = await randomSigner()
  this.ethersAccountBadVSigner = await mockLedgerSignerBadV()
  this.ownerAddress = this.ethersAccountSigner.address
  this.accountAddress = accountFromOwner(this.ownerAddress)

  // const { AccountSigner, Account } = brink({ network: 'hardhat' })

  // // account uses ethers signer 0 (not the account owner, it's acting as an executor)
  // this.account = Account(this.ownerAddress, {
  //   provider: ethers.provider,
  //   signer: this.defaultSigner
  // })

  // // account_ownerSigner uses ethers signer 1 (this is the account owner, it can do direct or meta calls)
  // this.account_ownerSigner = Account(this.ownerAddress, {
  //   provider: ethers.provider,
  //   signer: this.ethersAccountSigner
  // })

  const AccountImpl = await ethers.getContractFactory('Account')
  this.proxyAccountContract = await AccountImpl.attach(this.accountAddress)

  const MockAccountBits = await ethers.getContractFactory('MockAccountBits')
  this.mockAccountBits = await MockAccountBits.deploy()

  const MockUint256Oracle = await ethers.getContractFactory('MockUint256Oracle')
  this.mockUint256Oracle = await MockUint256Oracle.deploy()

  // // accountSigner uses ethers signer 1 (it's acting as the owner of the Brink account)
  // this.accountSigner = AccountSigner(this.ethersAccountSigner)

  // // accountSigner that signs "ledger style" with bad 'v' values 00 and 01
  // this.accountSignerBadV = AccountSigner(this.ethersAccountBadVSigner)

  this.token = await deploySaltedContract(
    'TestERC20',
    ['string', 'string', 'uint8'],
    ['TestToken', 'TKN', 18]
  )
  const tknDefaultBal = BN(10).pow(9).mul(BN(10).pow(18))
  await this.token.mint(this.accountAddress, tknDefaultBal)
  await this.token.mint(this.ethersAccountSigner.address, tknDefaultBal)

  this.token2 = await deploySaltedContract(
    'TestERC20',
    ['string', 'string', 'uint8'],
    ['TestToken_2', 'TKN2', 18]
  )
  await this.token2.mint(this.accountAddress, tknDefaultBal)
  await this.token2.mint(this.ethersAccountSigner.address, tknDefaultBal)

  this.nft1 = await deploySaltedContract(
    'TestERC721',
    ['string', 'string'],
    ['CryptoSkunks', 'SKUNKS']
  )

  // TestFulfillSwap is like a mock AMM, fill it with token and ETH to fulfill swaps
  this.testFulfillSwap = await deploySaltedContract('TestFulfillSwap')
  await this.token.mint(this.testFulfillSwap.address, tknDefaultBal)
  await this.token2.mint(this.testFulfillSwap.address, tknDefaultBal)
  await this.defaultSigner.sendTransaction({
    to: this.testFulfillSwap.address,
    value: ethers.BigNumber.from('10000000000000000000000000')
  })
  this.cryptoSkunkID = _.isUndefined(this.cryptoSkunkID) ? 1 : this.cryptoSkunkID + 1
  await this.nft1.mint(this.testFulfillSwap.address, this.cryptoSkunkID)

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
