import { getBlockIntervalDutchAuctionAmount } from '@brink-sdk/intents'
import { expect } from 'chai'

describe('getBlockIntervalDutchAuctionAmount', () => {

  it('should correctly return an amount for start of getBlockIntervalDutchAuctionAmount', async function () {
    const priceX96 = BigInt(118842243771396506390315925504000) // 1500   
    const inputAmount = BigInt(1_000000000000000000)
    const firstAuctionStartBlock = BigInt(16_485_101)
    const auctionDelayBlocks = BigInt(7_200) // ~1 day between auctions
    const auctionDurationBlocks = BigInt(75) // ~15 minute auction duration
    const startPercentE6 = BigInt(150000) // start at 15% above oracle price (150000 = 0.15 * 10**6)
    const endPercentE6 = BigInt(-150000) // end at 15% below oracle price (-150000 = -0.15 * 10**6);
    
    const amount: bigint = await getBlockIntervalDutchAuctionAmount({
      blockNumber: BigInt(0),
      previousAuctionFilledBlock: BigInt(0),
      oppositeTokenAmount: inputAmount,
      firstAuctionStartBlock,
      auctionDelayBlocks,
      auctionDurationBlocks,
      startPercentE6,
      endPercentE6,
      priceX96
    })

    const EXPECTED_AMOUNT = '1725000000000000000000' // Interval start, 15% of 1500 = 225, 1500 start price + 225 = 1725 (then add 18 zeros)
    expect(amount.toString()).to.equal(EXPECTED_AMOUNT)
  })

  it('should correctly return an amount for end of getBlockIntervalDutchAuctionAmount', async function () {
    const priceX96 = BigInt(118842243771396506390315925504000) // 1500   
    const inputAmount = BigInt(1_000000000000000000)
    const firstAuctionStartBlock = BigInt(0)
    const auctionDelayBlocks = BigInt(7_200) // ~1 day between auctions
    const auctionDurationBlocks = BigInt(75) // ~15 minute auction duration
    const startPercentE6 = BigInt(150000) // start at 15% above oracle price (150000 = 0.15 * 10**6)
    const endPercentE6 = BigInt(-150000) // end at 15% below oracle price (-150000 = -0.15 * 10**6);
    
    const amount: bigint = await getBlockIntervalDutchAuctionAmount({
      blockNumber: BigInt(75),
      previousAuctionFilledBlock: BigInt(0),
      oppositeTokenAmount: inputAmount,
      firstAuctionStartBlock,
      auctionDelayBlocks,
      auctionDurationBlocks,
      startPercentE6,
      endPercentE6,
      priceX96
    })

    const EXPECTED_AMOUNT = '1275000000000000000000' // Interval start, 15% of 1500 = 225, 1500 start price - 225 = 1275 (then add 18 zeros)
    expect(amount.toString()).to.equal(EXPECTED_AMOUNT)
  })

  it('should correctly return an amount for the middle of getBlockIntervalDutchAuctionAmount', async function () {
    const priceX96 = BigInt(118842243771396506390315925504000) // 1500   
    const inputAmount = BigInt(1_000000000000000000)
    const firstAuctionStartBlock = BigInt(0)
    const auctionDelayBlocks = BigInt(7_200) // ~1 day between auctions
    const auctionDurationBlocks = BigInt(100) 
    const startPercentE6 = BigInt(150000) // start at 15% above oracle price (150000 = 0.15 * 10**6)
    const endPercentE6 = BigInt(-150000) // end at 15% below oracle price (-150000 = -0.15 * 10**6);
    
    const amount: bigint = await getBlockIntervalDutchAuctionAmount({
      blockNumber: BigInt(50),
      previousAuctionFilledBlock: BigInt(0),
      oppositeTokenAmount: inputAmount,
      firstAuctionStartBlock,
      auctionDelayBlocks,
      auctionDurationBlocks,
      startPercentE6,
      endPercentE6,
      priceX96
    })

    const EXPECTED_AMOUNT = '1500000000000000000000'
    expect(amount.toString()).to.equal(EXPECTED_AMOUNT)
  })

})
