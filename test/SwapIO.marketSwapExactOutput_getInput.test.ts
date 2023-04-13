import { expect } from 'chai'
import { marketSwapExactOutput_getInput } from '../src/SwapIO'

describe('marketSwapExactOutput_getInput', function () {
  it('should return output and fee data', async function () {
    const res = await marketSwapExactOutput_getInput(
      BigInt(1800) * BigInt(10)**BigInt(18),
      BigInt(1) * BigInt(2)**BigInt(96) / BigInt(1500),
      BigInt(5) * BigInt(10)**BigInt(4),
      BigInt(0)
    )
    expect(res.input.toString()).to.equal('1199999999999999999')
    expect(res.fee.toString()).to.equal('59999999999999999')
    expect(res.inputWithFee.toString()).to.equal('1259999999999999998')
  })
})
