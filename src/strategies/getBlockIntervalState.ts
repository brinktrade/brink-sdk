import { RpcMethodCall, BigIntish } from '@brinkninja/types'

export type GetBlockIntervalStateArgs = {
  slot: BigIntish,
}

export type BlockIntervalState = {
  counter: BigInt,
  start: BigInt,
}

function getBlockIntervalState ({
  slot,
}: GetBlockIntervalStateArgs): BlockIntervalState {
  
  const start = BigInt(Number(BigInt(slot) & BigInt('0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF')));
  const counter = BigInt(Number((BigInt(slot) >> BigInt(128)) & BigInt('0xFFFF')));
  
 return {
    counter,
    start,
 }
} 

export default getBlockIntervalState


