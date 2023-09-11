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
  
  const start = Number(BigInt(slot) & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF'));
  const counter = Number((BigInt(slot) >> BigInt(128)) & BigInt('0xFFFF'));
  
 return {
    counter,
    start,
 }
} 

export default getBlockIntervalState


