import '@nomiclabs/hardhat-ethers'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers'
import { Contract, Wallet } from 'ethers'
import randomSigner from '../helpers/randomSigner'
import ERC20_abi from '../../src/internal/contracts/ERC20.abi'
import impersonate from '../helpers/impersonate'
import fundWithERC20 from '../helpers/fundWithERC20'
import { getSignerAccount } from '@brink-sdk'

export interface TestContext {
  WHALE: string
  USDC_ADDRESS: string
  WETH_ADDRESS: string
  defaultSigner: SignerWithAddress
  weth: Contract
  usdc: Contract
  ethersAccountSigner: Wallet
  signerAddress: string
  accountAddress: string
  proxyAccountContract: Contract
  filler: Contract
  whale: SignerWithAddress
}

declare module 'mocha' {
  export interface Context extends TestContext {}
}

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
  this.signerAddress = this.ethersAccountSigner.address
  this.accountAddress = getSignerAccount({ signer: this.signerAddress })

  const AccountImpl = await ethers.getContractFactory('Account')
  this.proxyAccountContract = await AccountImpl.attach(this.accountAddress)

  this.filler = await deploySaltedContract('TestFulfillSwap')

  this.whale = await impersonate(this.WHALE)
  await this.weth.connect(this.whale).transfer(this.filler.address, ethers.utils.parseEther('1000'))
  await fundWithERC20(this.whale, this.WETH_ADDRESS, this.filler.address, ethers.utils.parseEther('1000'))
})
