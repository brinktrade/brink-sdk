import { TestContext } from './setup'
import { expect } from 'chai'
import {
  deployAccount,
  unsignedLimitSwapData,
  LimitSwapExactInput,
  Order,
  Strategy,
  SignedStrategy,
  Token,
  UseBit,
  limitSwapExactInput_getOutput,
  executeStrategy,
  strategyEIP712TypedData,
  StrategyArgs,
  PriceCurveJSON,
  FillStateParams
} from '@brink-sdk'
import fundWithERC20 from '../helpers/fundWithERC20'
import { ethers } from 'hardhat'

const FLAT_PRICE_CURVE_ADDRESS = '0xc509733b8dddbab9369a96f6f216d6e59db3900f'
const PRICE_CURVE_PARAMS = '0x0000000000000000000000000000000000000000000d1b71758e219680000000' //hex representation of a DAI/WETH price, 0.0002 WETH as x96, x96 price = 0.0002 * 2**96 = 15845632502852868278059008

describe('executeStrategy with limitSwapExactInput', function () {
  it('should execute a simple limit swap strategy', async function () {
    const deployTx = await deployAccount({ signer: this.signerAddress })
    await this.defaultSigner.sendTransaction(deployTx)

    const { signedStrategy, unsignedSwapCall, daiInput } = await successfulExecuteStrategy.bind(this)()

    // store initial balances
    const signer_daiBal_0 = await this.dai.balanceOf(this.ethersAccountSigner.address)
    const filler_daiBal_0 = await this.dai.balanceOf(this.filler.address)

    // execute order 0 for the strategy
    const tx = await executeStrategy({
      signedStrategy,
      orderIndex: 0,
      unsignedCalls: [unsignedSwapCall]
    })
    await this.defaultSigner.sendTransaction(tx)

    // expect signer to have paid USDC and received WETH
    const signer_daiBal_1 = await this.dai.balanceOf(this.ethersAccountSigner.address)
    const signer_daiBal_diff = BigInt(signer_daiBal_1 - signer_daiBal_0)
    expect(signer_daiBal_diff.toString()).to.equal((-daiInput).toString())

    // expect filler to have paid WETH and received USDC
    const filler_daiBal_1 = await this.dai.balanceOf(this.filler.address)
    const filler_daiBal_diff = BigInt(filler_daiBal_1 - filler_daiBal_0)
    expect(filler_daiBal_diff.toString()).to.equal(daiInput.toString())
  })
})

async function successfulExecuteStrategy (this: TestContext): Promise<{
  daiInput: bigint,
  wethOutput: bigint,
  signedStrategy: SignedStrategy,
  unsignedSwapCall: string
}> {
  const dai = new Token({ address: this.DAI_ADDRESS })
  const weth = new Token({ address: this.WETH_ADDRESS })

  const priceCurve: PriceCurveJSON = {
    address: FLAT_PRICE_CURVE_ADDRESS,
    params: PRICE_CURVE_PARAMS
  }

  const daiInput = BigInt(100) * BigInt(10**17) // 100 DAI

  // build the limit swap strategy
  const strategy = new Strategy()
  strategy.orders[0] = new Order()
  strategy.orders[0].primitives[0] = new UseBit({ index: BigInt(0), value: BigInt(2**0) })


  const fillStateParams = new FillStateParams({
    id: ethers.BigNumber.from(ethers.utils.randomBytes(8)).toString(),
    startX96: BigInt(0),
    sign: true
  })
  
  strategy.orders[0].primitives[1] = new LimitSwapExactInput({
    priceCurve,
    signer: this.signerAddress,
    tokenIn: new Token({ address: this.DAI_ADDRESS }),
    tokenOut: new Token({ address: this.WETH_ADDRESS }),
    tokenInAmount: daiInput,
    fillStateParams
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
  await fundWithERC20(this.whale, this.DAI_ADDRESS, this.ethersAccountSigner.address, daiInput)
  await this.dai.connect(this.ethersAccountSigner).approve(this.accountAddress, daiInput)

  // use the USDC/WETH price oracle to get the exact expected WETH output
  const wethOutput: bigint = await limitSwapExactInput_getOutput({ input: daiInput, filledInput: BigInt(0), totalInput: daiInput, priceCurve: `flat`, priceCurveParams: priceCurve.params })

  // get call data to fill the swap
  const fillData = (await this.filler.populateTransaction.fulfillTokenOutSwap(
    this.WETH_ADDRESS, wethOutput.toString(), this.signerAddress
  )).data

  // get unsigned data for the marketSwapExactInput primitive
  const unsignedSwapCall = await unsignedLimitSwapData({
    recipient: this.filler.address,
    amount: daiInput,
    callData: {
      targetContract: this.filler.address,
      data: fillData as string
    }
  })

  return {
    daiInput,
    wethOutput,
    signedStrategy,
    unsignedSwapCall
  }
}
