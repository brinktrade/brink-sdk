import { BigIntish } from '@brinkninja/types';
import { soliditySha3 } from 'web3-utils';

export type blockIntervalPointerArgs = {
  id: BigIntish
}

const blockIntervalPointer = ({
  id
}: blockIntervalPointerArgs): string | null => {
  return soliditySha3(
    { type: 'uint64', value: id.toString() },
    { type: 'string', value: "blockInterval" }
  )
}

export default blockIntervalPointer
