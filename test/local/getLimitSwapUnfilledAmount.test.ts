import { expect } from 'chai'
import { getLimitSwapUnfilledAmount } from '@brink-sdk'

const totalAmount = BigInt(1200) * BigInt(10)**BigInt(6)

describe('getLimitSwapUnfilledAmount', function () {
  it('should return unfilled amount of total when fill state is empty', async function () {
    const unfilledAmount = await getLimitSwapUnfilledAmount({
      fillStateStartX96: 0,
      fillStateSign: true,
      fillStateX96: 0,
      totalAmount
    })
    expect(unfilledAmount).to.equal(totalAmount)
  })

  it('should return unfilled amount of 0 when fill state is full', async function () {
    const unfilledAmount = await getLimitSwapUnfilledAmount({
      fillStateStartX96: BigInt(1) * BigInt(2)**BigInt(96),
      fillStateSign: true,
      fillStateX96: 0,
      totalAmount
    })
    expect(unfilledAmount).to.equal(0n)
  })

  it('should return unfilled amount of the unfilled partial portion when fill state is partial', async function () {
    const unfilledAmount = await getLimitSwapUnfilledAmount({
      fillStateStartX96: BigInt(1) * BigInt(2)**BigInt(96) / BigInt(4),
      fillStateSign: true,
      fillStateX96: 0,
      totalAmount
    })
    expect(unfilledAmount).to.equal(totalAmount - (totalAmount / BigInt(4)))
  })
})
