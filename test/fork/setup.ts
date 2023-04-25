import { ethers } from 'hardhat'
import brink from '@brink-sdk'
import randomSigner from '../helpers/randomSigner'

const deploySaltedContract = require('@brinkninja/core/test/helpers/deploySaltedContract')

beforeEach(async function () {
  const signers = await ethers.getSigners()
  this.defaultSigner = signers[0]

  this.ethersAccountSigner = await randomSigner()
  this.ownerAddress = this.ethersAccountSigner.address

  const { AccountSigner, Account } = brink({ network: 'hardhat' })

  // account uses ethers signer 0 (not the account owner, it's acting as an executor)
  this.account = Account(this.ownerAddress, {
    provider: ethers.provider,
    signer: this.defaultSigner
  })

  // account_ownerSigner uses ethers signer 1 (this is the account owner, it can do direct or meta calls)
  this.account_ownerSigner = Account(this.ownerAddress, {
    provider: ethers.provider,
    signer: this.ethersAccountSigner
  })

  const AccountImpl = await ethers.getContractFactory('Account')
  this.proxyAccountContract = await AccountImpl.attach(this.account.address)

  // accountSigner uses ethers signer 1 (it's acting as the owner of the Brink account)
  this.accountSigner = AccountSigner(this.ethersAccountSigner)

  this.testFulfillSwap = await deploySaltedContract('TestFulfillSwap')
})
