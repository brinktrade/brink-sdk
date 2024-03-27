import { BigIntish } from '@brinkninja/types';
import { ethers } from 'ethers';

export type blockIntervalPointerArgs = {
  id: BigIntish
}

const blockIntervalPointer = ({
  id
}: blockIntervalPointerArgs): string => ethers.keccak256(ethers.AbiCoder.defaultAbiCoder().encode(['uint64', 'string'], [id?.toString(), 'blockInterval']))

export default blockIntervalPointer
