import Oracle from './Oracle'
import readUint256Oracle from './readUint256Oracle'
import { CallData } from '@brinkninja/types'

export type Uint256OracleConstructorArgs = {
  address: string
  params: string
}

abstract class Uint256Oracle extends Oracle {

  constructor ({
    address,
    params
  }: Uint256OracleConstructorArgs) {
    super({ address, params })
  }

  async read (): Promise<CallData> {
    return await readUint256Oracle({
      address: this.address,
      params: this.params
    })
  }

}

export default Uint256Oracle
