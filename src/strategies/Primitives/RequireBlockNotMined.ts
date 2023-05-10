import Primitive from './Primitive'

export type RequireBlockNotMinedConstructorArgs = {
  blockNumber: BigInt
}

export default class RequireBlockNotMined extends Primitive {
  public constructor ({ blockNumber }: RequireBlockNotMinedConstructorArgs) {
    super({
      functionName: 'requireBlockNotMined',
      params: { blockNumber }
    })
  }
}
