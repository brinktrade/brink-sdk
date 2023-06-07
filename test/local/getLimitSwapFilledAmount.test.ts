import { expect } from 'chai'
import { getLimitSwapFilledAmount } from '@brink-sdk'

const totalAmount = BigInt(1200) * BigInt(10)**BigInt(6)

describe('getLimitSwapFilledAmount', function () {
  it('should return filled amount of 0 when fill state is empty', async function () {
    const filledAmount = await getLimitSwapFilledAmount({
      fillStateStartX96: 0,
      fillStateSign: true,
      fillStateX96: 0,
      totalAmount
    })
    expect(filledAmount).to.equal(0n)
  })

  it('should return filled amount of total when fill state is full', async function () {
    const filledAmount = await getLimitSwapFilledAmount({
      fillStateStartX96: BigInt(1) * BigInt(2)**BigInt(96),
      fillStateSign: true,
      fillStateX96: 0,
      totalAmount
    })
    expect(filledAmount).to.equal(totalAmount)
  })

  it('should return filled amount of partial when fill state is partial', async function () {
    const filledAmount = await getLimitSwapFilledAmount({
      fillStateStartX96: BigInt(1) * BigInt(2)**BigInt(96) / BigInt(4),
      fillStateSign: true,
      fillStateX96: 0,
      totalAmount
    })
    expect(filledAmount).to.equal(totalAmount / BigInt(4))
  })
})
