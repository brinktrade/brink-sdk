import { ethers } from 'hardhat'
import { expect } from 'chai'
import {
  unsignedMarketSwapData,
  MarketSwapExactInput,
  Order,
  Strategy,
  Token,
  UniV3Twap,
  UseBit,
  IdsProof,
  marketSwapExactInput_getOutput,
  executeStrategy
} from '@brink-sdk'
import fundWithERC20 from '../helpers/fundWithERC20'

describe('executeStrategy', function () {
  it('should execute a simple market swap strategy', async function () {
    await this.account.deploy()

    const usdc = new Token(this.USDC_ADDRESS)
    const weth = new Token(this.WETH_ADDRESS)
    const priceOracle = new UniV3Twap(usdc, weth, BigInt(1000))

    const usdcInput = BigInt(1450_000000)
    const feePercent = BigInt(10000)
    const feeMin = BigInt(0)

    // build the market swap strategy
    const strategy = new Strategy()
    strategy.orders[0] = new Order()
    strategy.orders[0].primitives[0] = new UseBit(BigInt(0), BigInt(2**0))
    strategy.orders[0].primitives[1] = new MarketSwapExactInput(
      priceOracle,
      await this.accountSigner.signerAddress(),
      new Token(this.USDC_ADDRESS),
      new Token(this.WETH_ADDRESS),
      usdcInput,
      feePercent,
      feeMin
    )

    // sign the strategy
    const signedStrategy = await this.accountSigner.signStrategyEIP712(await strategy.toJSON())

    // fund and approve USDC
    await fundWithERC20(this.whale, this.USDC_ADDRESS, this.ethersAccountSigner.address, usdcInput)
    await this.usdc.connect(this.ethersAccountSigner).approve(this.account.address, usdcInput)

    // use the USDC/WETH price oracle to get the exact expected WETH output
    const priceX96 = await priceOracle.price(ethers.provider)
    const { output: wethOutput } = await marketSwapExactInput_getOutput(
      usdcInput,
      priceX96,
      feePercent,
      feeMin
    )

    // get call data to fill the swap
    this.fillData = (await this.filler.populateTransaction.fulfillTokenOutSwap(
      this.WETH_ADDRESS, wethOutput.toString(), this.ownerAddress
    )).data

    // get unsigned data for the marketSwapExactInput primitive
    const unsignedSwapCall = await unsignedMarketSwapData(
      this.filler.address,
      new IdsProof(),
      new IdsProof(),
      {
        targetContract: this.filler.address,
        data: this.fillData
      }
    )

    // store initial balances
    const signer_usdcBal_0 = await this.usdc.balanceOf(this.ethersAccountSigner.address)
    const signer_wethBal_0 = await this.weth.balanceOf(this.ethersAccountSigner.address)
    const filler_usdcBal_0 = await this.usdc.balanceOf(this.filler.address)
    const filler_wethBal_0 = await this.weth.balanceOf(this.filler.address)

    // execute order 0 for the strategy
    const executeStrategyAction = await executeStrategy({
      signedStrategy,
      orderIndex: 0,
      unsignedCalls: [unsignedSwapCall]
    })
    await this.defaultSigner.sendTransaction(executeStrategyAction.tx)

    // expect signer to have paid USDC and received WETH
    const signer_usdcBal_1 = await this.usdc.balanceOf(this.ethersAccountSigner.address)
    const signer_wethBal_1 = await this.weth.balanceOf(this.ethersAccountSigner.address)
    const signer_usdcBal_diff = BigInt(signer_usdcBal_1 - signer_usdcBal_0)
    const signer_wethBal_diff = BigInt(signer_wethBal_1 - signer_wethBal_0)
    expect(signer_usdcBal_diff.toString()).to.equal((-usdcInput).toString())
    expect(signer_wethBal_diff.toString()).to.equal('784657687263476480')

    // expect filler to have paid WETH and received USDC
    const filler_usdcBal_1 = await this.usdc.balanceOf(this.filler.address)
    const filler_wethBal_1 = await this.weth.balanceOf(this.filler.address)
    const filler_usdcBal_diff = BigInt(filler_usdcBal_1 - filler_usdcBal_0)
    const filler_wethBal_diff = BigInt(filler_wethBal_1 - filler_wethBal_0)
    expect(filler_usdcBal_diff.toString()).to.equal(usdcInput.toString())
    expect(filler_wethBal_diff.toString()).to.equal('-784657687263576064')
  })
})