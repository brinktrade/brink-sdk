import { expect } from 'chai'
import { marketSwapExactInput_getOutput } from '@brink-sdk'

describe('marketSwapExactInput_getOutput', function () {
  it('should return output and fee data', async function () {
    const res = await marketSwapExactInput_getOutput({
      input: BigInt(1800) * BigInt(10)**BigInt(18),
      priceX96: BigInt(1500) * BigInt(2)**BigInt(96),
      feePercent: BigInt(5) * BigInt(10)**BigInt(4),
      feeMin: BigInt(0)
    })
    expect(res.output.toString()).to.equal('2700000000000000000000000')
    expect(res.fee.toString()).to.equal('135000000000000000000000')
    expect(res.outputWithFee.toString()).to.equal('2565000000000000000000000')
  })
})
