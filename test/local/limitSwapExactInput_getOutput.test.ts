import { expect } from 'chai'
import { utils } from 'ethers'
import { limitSwapExactInput_getOutput } from '@brink-sdk'

const { defaultAbiCoder } = utils

describe('limitSwapExactInput_getOutput', function () {
  it('should return output', async function () {
    const basePriceX96_bigint = (1n * 10n**18n) * (2n**96n) / (1800n * 10n**6n) // 1 ETH / 1800 USDC * 2^96
    const basePriceX96 = defaultAbiCoder.encode(['uint256'], [basePriceX96_bigint])

    const output = await limitSwapExactInput_getOutput({
      input: 500n * 10n**6n,
      filledInput: 1000n * 10n**6n,
      totalInput: 2000n * 10n**6n,
      priceCurve: 'flat',
      priceCurveParams: basePriceX96
    })
    expect(output).to.equal(277777777777777778n) // ~ 0.28 ETH output (from 500 USDC input)
  })

  it('should throw error when input exceeds unfilled input', async function () {
    const basePriceX96_bigint = (1n * 10n**18n) * (2n**96n) / (1800n * 10n**6n) // 1 ETH / 1800 USDC * 2^96
    const basePriceX96 = defaultAbiCoder.encode(['uint256'], [basePriceX96_bigint])

    await expect(limitSwapExactInput_getOutput({
      input: 1000n * 10n**6n + 1n,
      filledInput: 1000n * 10n**6n,
      totalInput: 2000n * 10n**6n,
      priceCurve: 'flat',
      priceCurveParams: basePriceX96
    })).to.be.rejectedWith('input 1000000001 is more than unfilled input 1000000000')
  })

  it('should throw error when filledInput exceeds totalInput', async function () {
    const basePriceX96_bigint = (1n * 10n**18n) * (2n**96n) / (1800n * 10n**6n) // 1 ETH / 1800 USDC * 2^96
    const basePriceX96 = defaultAbiCoder.encode(['uint256'], [basePriceX96_bigint])

    await expect(limitSwapExactInput_getOutput({
      input: 500n * 10n**6n,
      filledInput: 3000n * 10n**6n,
      totalInput: 2000n * 10n**6n,
      priceCurve: 'flat',
      priceCurveParams: basePriceX96
    })).to.be.rejectedWith('filledInput cannot be greater than totalInput')
  })
})
