import { RpcMethodCall, BigIntish } from '@brinkninja/types'

export type GetBlockIntervalStateArgs = {
  slot: BigIntish,
}

export type BlockIntervalState = {
  counter: BigIntish,
  start: BigIntish,
}

function getBlockIntervalState ({
  slot,
}: GetBlockIntervalStateArgs): BlockIntervalState {
  
  let start = Number(BigInt(slot) & BigInt("0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF"));
  let counter = Number((BigInt(slot) >> BigInt(128)) & BigInt(0xFFFF));
  
 return {
    counter,
    start,
 }
} 

export default getBlockIntervalState


