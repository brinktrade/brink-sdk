import { BigIntish } from '@brinkninja/types'
import Primitive from './Primitive'

export type RequireBlockNotMinedConstructorArgs = {
  blockNumber: BigIntish
}

export default class RequireBlockNotMined extends Primitive {
  public constructor ({ blockNumber }: RequireBlockNotMinedConstructorArgs) {
    super({
      functionName: 'requireBlockNotMined',
      params: {
        blockNumber: BigInt(blockNumber)
      }
    })
  }
}
