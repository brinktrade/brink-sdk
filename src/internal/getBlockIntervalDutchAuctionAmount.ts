import { EthereumJsVm as evm } from '.'

export default async function getBlockIntervalDutchAuctionAmount (
  blockNumber: bigint, 
  previousAuctionFilledBlock: bigint,
  oppositeTokenAmount: bigint,
  firstAuctionStartBlock: bigint,
  auctionDelayBlocks: bigint,
  auctionDurationBlocks: bigint,
  startPercentE6: bigint,
  endPercentE6: bigint,
  priceX96: bigint
): Promise<bigint> {
  const auctionAmount: bigint = await evm.BlockIntervalDutchAuctionAmount01.getAuctionAmount(
    blockNumber, 
    previousAuctionFilledBlock,
    oppositeTokenAmount,
    firstAuctionStartBlock,
    auctionDelayBlocks,
    auctionDurationBlocks,
    startPercentE6,
    endPercentE6,
    priceX96
  )
  return auctionAmount
}
