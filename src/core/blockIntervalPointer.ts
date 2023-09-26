import { BigIntish } from '@brinkninja/types';
import { ethers } from 'ethers';

export type blockIntervalPointerArgs = {
  id: BigIntish
}

const blockIntervalPointer = ({
  id
}: blockIntervalPointerArgs): string => ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['uint64', 'string'], [id?.toString(), 'blockInterval']))

export default blockIntervalPointer
