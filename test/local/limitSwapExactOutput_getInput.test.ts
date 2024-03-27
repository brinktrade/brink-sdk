import { expect } from 'chai'
import { limitSwapExactOutput_getInput } from '@brink-sdk'
import { ethers } from 'ethers'

const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder()

describe('limitSwapExactOutput_getInput', function () {
  it('should return output', async function () {
    const basePriceX96_bigint = (1n * 10n**18n) * (2n**96n) / (1800n * 10n**6n) // 1 ETH / 1800 USDC * 2^96
    const basePriceX96 = defaultAbiCoder.encode(['uint256'], [basePriceX96_bigint])

    const input = await limitSwapExactOutput_getInput({
      output: 500n * 10n**6n,
      filledOutput: 1000n * 10n**6n,
      totalOutput: 2000n * 10n**6n,
      priceCurve: 'flat',
      priceCurveParams: basePriceX96
    })
    expect(input).to.equal(277777777777777778n) // ~ 0.28 ETH input (from 500 USDC output)
  })

  it('should throw error when output exceeds unfilled output', async function () {
    const basePriceX96_bigint = (1n * 10n**18n) * (2n**96n) / (1800n * 10n**6n) // 1 ETH / 1800 USDC * 2^96
    const basePriceX96 = defaultAbiCoder.encode(['uint256'], [basePriceX96_bigint])

    await expect(limitSwapExactOutput_getInput({
      output: 1000n * 10n**6n + 1n,
      filledOutput: 1000n * 10n**6n,
      totalOutput: 2000n * 10n**6n,
      priceCurve: 'flat',
      priceCurveParams: basePriceX96
    })).to.be.rejectedWith('output 1000000001 is more than unfilled output 1000000000')
  })

  it('should throw error when filledOutput exceeds totalOutput', async function () {
    const basePriceX96_bigint = (1n * 10n**18n) * (2n**96n) / (1800n * 10n**6n) // 1 ETH / 1800 USDC * 2^96
    const basePriceX96 = defaultAbiCoder.encode(['uint256'], [basePriceX96_bigint])

    await expect(limitSwapExactOutput_getInput({
      output: 500n * 10n**6n,
      filledOutput: 3000n * 10n**6n,
      totalOutput: 2000n * 10n**6n,
      priceCurve: 'flat',
      priceCurveParams: basePriceX96
    })).to.be.rejectedWith('filledOutput cannot be greater than totalOutput')
  })
})
