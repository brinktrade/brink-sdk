import { EthereumJsVm as evm } from '../internal'

export type getBlockIntervalDutchAuctionAmountArgs = {
  blockNumber: bigint, 
  previousAuctionFilledBlock: bigint,
  oppositeTokenAmount: bigint,
  firstAuctionStartBlock: bigint,
  auctionDelayBlocks: bigint,
  auctionDurationBlocks: bigint,
  startPercentE6: bigint,
  endPercentE6: bigint,
  priceX96: bigint
}

export default async function getBlockIntervalDutchAuctionAmount ({
  blockNumber, 
  previousAuctionFilledBlock,
  oppositeTokenAmount,
  firstAuctionStartBlock,
  auctionDelayBlocks,
  auctionDurationBlocks,
  startPercentE6,
  endPercentE6,
  priceX96
}: getBlockIntervalDutchAuctionAmountArgs): Promise<bigint> {
  
  const auctionAmount: bigint = await evm.getAuctionAmount(
    blockNumber.toString(), 
    previousAuctionFilledBlock.toString(),
    oppositeTokenAmount.toString(),
    firstAuctionStartBlock.toString(),
    auctionDelayBlocks.toString(),
    auctionDurationBlocks.toString(),
    startPercentE6.toString(),
    endPercentE6.toString(),
    priceX96.toString(),
  )
  return auctionAmount
}
