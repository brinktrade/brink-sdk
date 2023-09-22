import { TestContext } from './setup'
import { expect } from 'chai'
import {
  deployAccount,
  unsignedMarketSwapData,
  MarketSwapExactInput,
  Order,
  Strategy,
  SignedStrategy,
  Token,
  UniV3Twap,
  UseBit,
  marketSwapExactInput_getOutput,
  executeStrategy,
  strategyEIP712TypedData,
  StrategyArgs
} from '@brink-sdk'
import fundWithERC20 from '../helpers/fundWithERC20'

describe('executeStrategy with marketSwapExactInput', function () {
  it('should execute a simple market swap strategy', async function () {
    const deployTx = await deployAccount({ signer: this.signerAddress })
    await this.defaultSigner.sendTransaction(deployTx)

    const { signedStrategy, unsignedSwapCall, usdcInput } = await successfulExecuteStrategy.bind(this)()

    // store initial balances
    const signer_usdcBal_0 = await this.usdc.balanceOf(this.ethersAccountSigner.address)
    const signer_wethBal_0 = await this.weth.balanceOf(this.ethersAccountSigner.address)
    const filler_usdcBal_0 = await this.usdc.balanceOf(this.filler.address)
    const filler_wethBal_0 = await this.weth.balanceOf(this.filler.address)

    // execute order 0 for the strategy
    const tx = await executeStrategy({
      signedStrategy,
      orderIndex: 0,
      unsignedCalls: [unsignedSwapCall]
    })
    await this.defaultSigner.sendTransaction(tx)

    // expect signer to have paid USDC and received WETH
    const signer_usdcBal_1 = await this.usdc.balanceOf(this.ethersAccountSigner.address)
    const signer_wethBal_1 = await this.weth.balanceOf(this.ethersAccountSigner.address)
    const signer_usdcBal_diff = BigInt(signer_usdcBal_1 - signer_usdcBal_0)
    const signer_wethBal_diff = BigInt(signer_wethBal_1 - signer_wethBal_0)
    expect(signer_usdcBal_diff.toString()).to.equal((-usdcInput).toString())
    expect(signer_wethBal_diff.toString()).to.equal('890908034345159936')

    // expect filler to have paid WETH and received USDC
    const filler_usdcBal_1 = await this.usdc.balanceOf(this.filler.address)
    const filler_wethBal_1 = await this.weth.balanceOf(this.filler.address)
    const filler_usdcBal_diff = BigInt(filler_usdcBal_1 - filler_usdcBal_0)
    const filler_wethBal_diff = BigInt(filler_wethBal_1 - filler_wethBal_0)
    expect(filler_usdcBal_diff.toString()).to.equal(usdcInput.toString())
    expect(filler_wethBal_diff.toString()).to.equal('-890908034345205760')
  })

  it('executing with a bad v signature value (ledger) should be converted to valid and succeed', async function () {
    const deployTx = await deployAccount({ signer: this.signerAddress })
    await this.defaultSigner.sendTransaction(deployTx)

    const { signedStrategy, unsignedSwapCall } = await successfulExecuteStrategy.bind(this)()

    // modify the signature to have a bad v value
    const v = signedStrategy.signature.slice(-2)
    const badV = v == '1b' ? '00' : '01'
    signedStrategy.signature = signedStrategy.signature.slice(0, -2) + badV

    // execute order 0 for the strategy
    const tx = await executeStrategy({
      signedStrategy,
      orderIndex: 0,
      unsignedCalls: [unsignedSwapCall]
    })
    await this.defaultSigner.sendTransaction(tx)
  })
})

async function successfulExecuteStrategy (this: TestContext): Promise<{
  usdcInput: bigint,
  wethOutput: bigint,
  signedStrategy: SignedStrategy,
  unsignedSwapCall: string
}> {
  const usdc = new Token({ address: this.USDC_ADDRESS })
  const weth = new Token({ address: this.WETH_ADDRESS })
  const priceOracle = new UniV3Twap({
    tokenA: usdc,
    tokenB: weth,
    interval: BigInt(1000)
  })

  const usdcInput = BigInt(1450_000000)
  const feePercent = BigInt(10000)
  const feeMin = BigInt(0)

  // build the market swap strategy
  const strategy = new Strategy()
  strategy.orders[0] = new Order()
  strategy.orders[0].primitives[0] = new UseBit({ index: BigInt(0), value: BigInt(2**0) })
  strategy.orders[0].primitives[1] = new MarketSwapExactInput({
    oracle: priceOracle,
    signer: this.signerAddress,
    tokenIn: new Token({ address: this.USDC_ADDRESS }),
    tokenOut: new Token({ address: this.WETH_ADDRESS }),
    tokenInAmount: usdcInput,
    feePercent,
    feeMin
  })

  // sign the strategy
  const chainId = 31337
  const strategyJSON = await strategy.toJSON()
  const { domain, types, value } = await strategyEIP712TypedData({
    signer: this.ethersAccountSigner.address,
    chainId,
    strategy: strategyJSON as StrategyArgs
  })
  const signature = await this.ethersAccountSigner._signTypedData(
    domain, types, value
  )
  const signedStrategy = new SignedStrategy({
    strategy: strategyJSON as StrategyArgs,
    chainId,
    signature,
    signer: this.ethersAccountSigner.address
  })

  // fund and approve USDC
  await fundWithERC20(this.whale, this.USDC_ADDRESS, this.ethersAccountSigner.address, usdcInput)
  await this.usdc.connect(this.ethersAccountSigner).approve(this.accountAddress, usdcInput)

  // use the USDC/WETH price oracle to get the exact expected WETH output
  const priceX96 = await this.defaultSigner.call(await priceOracle.price())
  const { output: wethOutput } = await marketSwapExactInput_getOutput({
    input: usdcInput,
    priceX96,
    feePercent,
    feeMin
  })

  // get call data to fill the swap
  const fillData = (await this.filler.populateTransaction.fulfillTokenOutSwap(
    this.WETH_ADDRESS, wethOutput.toString(), this.signerAddress
  )).data

  // get unsigned data for the marketSwapExactInput primitive
  const unsignedSwapCall = await unsignedMarketSwapData({
    recipient: this.filler.address,
    callData: {
      targetContract: this.filler.address,
      data: fillData as string
    }
  })

  return {
    usdcInput,
    wethOutput,
    signedStrategy,
    unsignedSwapCall
  }
}