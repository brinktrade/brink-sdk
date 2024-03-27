import { soliditySha3 } from 'web3-utils'
import { ethers } from 'ethers'
import { RpcMethodCall, BigIntish } from '@brinkninja/types'
import { storageLoad } from '../core'

const defaultAbiCoder = ethers.AbiCoder.defaultAbiCoder()

export type GetLimitSwapFillStateArgs = {
  signer: string
  fillStateId: BigIntish
}

export default function getLimitSwapFillState ({
  signer,
  fillStateId
}: GetLimitSwapFillStateArgs): RpcMethodCall {
  const fillStateStr = defaultAbiCoder.encode(['uint64', 'string'], [fillStateId, 'fillState'])
  const fillStatePtr = soliditySha3(fillStateStr) as string
  return storageLoad({ signer, pointer: fillStatePtr })
}
