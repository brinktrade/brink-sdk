import '@nomiclabs/hardhat-ethers'
import hre from 'hardhat'
// import brink from '@brink-sdk'
import randomSigner from '../helpers/randomSigner'
import ERC20_abi from '../../src/contracts/ERC20.abi'
import impersonate from '../helpers/impersonate'
import fundWithERC20 from '../helpers/fundWithERC20'
import { accountFromOwner } from '@brink-sdk'

const { ethers } = hre

const deploySaltedContract = require('@brinkninja/core/test/helpers/deploySaltedContract')

beforeEach(async function () {
  // Avalanche Bridge used as "whale" to fund other addresses
  this.WHALE = '0x8EB8a3b98659Cce290402893d0123abb75E3ab28'

  this.USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
  this.WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'

  const signers = await ethers.getSigners()
  this.defaultSigner = signers[0]

  this.weth = new ethers.Contract(this.WETH_ADDRESS, ERC20_abi, this.defaultSigner)
  this.usdc = new ethers.Contract(this.USDC_ADDRESS, ERC20_abi, this.defaultSigner)

  this.ethersAccountSigner = await randomSigner()
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

  // // accountSigner uses ethers signer 1 (it's acting as the owner of the Brink account)
  // this.accountSigner = AccountSigner(this.ethersAccountSigner)

  this.filler = await deploySaltedContract('TestFulfillSwap')

  this.whale = await impersonate(this.WHALE)
  await this.weth.connect(this.whale).transfer(this.filler.address, ethers.utils.parseEther('1000'))
  await fundWithERC20(this.whale, this.WETH_ADDRESS, this.filler.address, ethers.utils.parseEther('1000'))
})
