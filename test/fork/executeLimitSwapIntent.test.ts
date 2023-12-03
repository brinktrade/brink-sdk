import { TestContext } from './setup'
import { expect } from 'chai'
import {
  deployAccount,
  unsignedLimitSwapData,
  LimitSwapExactInput,
  DeclarationIntent,
  Declaration,
  SignedDeclaration,
  Token,
  UniV3Twap,
  UseBit,
  executeIntent,
  declarationEIP712TypedData,
  DeclarationArgs,
  FillStateParams,
  limitSwapExactInput_getOutput
} from '@brink-sdk'
import fundWithERC20 from '../helpers/fundWithERC20'

const { FLAT_PRICE_CURVE } = require('@brinkninja/config').mainnet

const legacyStrategyConstants = require('@brinkninja/strategies/constants.js')

describe('executeIntent with limitSwapExactInput', function () {
  it('should execute a simple limit swap intent', async function () {
    const deployTx = await deployAccount({ signer: this.signerAddress })
    await this.defaultSigner.sendTransaction(deployTx)

    const { signedDeclaration, unsignedSwapCall, usdcInput } = await successfulExecuteDeclaration.bind(this)()

    // store initial balances
    const signer_usdcBal_0 = await this.usdc.balanceOf(this.ethersAccountSigner.address)
    const signer_wethBal_0 = await this.weth.balanceOf(this.ethersAccountSigner.address)
    const filler_usdcBal_0 = await this.usdc.balanceOf(this.filler.address)
    const filler_wethBal_0 = await this.weth.balanceOf(this.filler.address)

    // execute intent 0 for the declaration
    const tx = await executeIntent({
      signedDeclaration,
      intentIndex: 0,
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
})

async function successfulExecuteDeclaration (this: TestContext): Promise<{
  usdcInput: bigint,
  wethOutput: bigint,
  signedDeclaration: SignedDeclaration,
  unsignedSwapCall: string
}> {
  const usdc = new Token({ address: this.USDC_ADDRESS })
  const weth = new Token({ address: this.WETH_ADDRESS })
  const usdcInput = BigInt(1450_000000)

  const priceOracle = new UniV3Twap({
    tokenA: usdc,
    tokenB: weth,
    interval: BigInt(1000)
  })
  
  // use the USDC/WETH price oracle to get the exact expected WETH output
  const priceX96 = await this.defaultSigner.call(await priceOracle.price())

  const priceCurve = {
    address: FLAT_PRICE_CURVE,
    params: priceX96.toString()
  }

  const wethOutput = await limitSwapExactInput_getOutput({
    input: usdcInput,
    filledInput: 0,
    totalInput: usdcInput,
    priceCurve: 'flat',
    priceCurveParams: priceCurve.params
  })

  // build the market swap declaration
  const declaration = new Declaration()
  declaration.segmentsContract = legacyStrategyConstants.PRIMITIVES_01
  declaration.intents[0] = new DeclarationIntent()
  declaration.intents[0].segments[0] = new UseBit({ index: BigInt(0), value: BigInt(2**0) })
  declaration.intents[0].segments[1] = new LimitSwapExactInput({
    priceCurve,
    signer: this.signerAddress,
    tokenIn: new Token({ address: this.USDC_ADDRESS }),
    tokenOut: new Token({ address: this.WETH_ADDRESS }),
    tokenInAmount: usdcInput,
    fillStateParams: new FillStateParams({
      id: BigInt(12345),
      sign: true,
      startX96: 0
    })
  })

  // sign the declaration
  const chainId = 31337
  const declarationJSON = await declaration.toJSON()
  const { domain, types, value } = await declarationEIP712TypedData({
    signer: this.ethersAccountSigner.address,
    chainId,
    declaration: declarationJSON as DeclarationArgs,
    declarationContract: legacyStrategyConstants.STRATEGY_TARGET_01
  })
  const signature = await this.ethersAccountSigner._signTypedData(
    domain, types, value
  )
  const signedDeclaration = new SignedDeclaration({
    declaration: declarationJSON as DeclarationArgs,
    chainId,
    signature,
    signer: this.ethersAccountSigner.address,
    declarationContract: legacyStrategyConstants.STRATEGY_TARGET_01
  })

  // fund and approve USDC
  await fundWithERC20(this.whale, this.USDC_ADDRESS, this.ethersAccountSigner.address, usdcInput)
  await this.usdc.connect(this.ethersAccountSigner).approve(this.accountAddress, usdcInput)

  // get call data to fill the swap
  const fillData = (await this.filler.populateTransaction.fulfillTokenOutSwap(
    this.WETH_ADDRESS, wethOutput.toString(), this.signerAddress
  )).data

  // get unsigned data for the marketSwapExactInput segment
  const unsignedSwapCall = await unsignedLimitSwapData({
    recipient: this.filler.address,
    amount: usdcInput,
    callData: {
      targetContract: this.filler.address,
      data: fillData as string
    }
  })

  return {
    usdcInput,
    wethOutput,
    signedDeclaration,
    unsignedSwapCall
  }
}
