import Oracle from './Oracle'
import readUint256Oracle from './readUint256Oracle'
import { CallData } from '../Types'

export type Uint256OracleConstructorArgs = {
  contractAddress: string
  paramsEncoded: string
}

abstract class Uint256Oracle extends Oracle {

  constructor ({
    contractAddress,
    paramsEncoded
  }: Uint256OracleConstructorArgs) {
    super({ contractAddress, paramsEncoded })
  }

  async read (): Promise<CallData> {
    return await readUint256Oracle({
      oracleAddress: this.contractAddress,
      oracleParams: this.paramsEncoded
    })
  }

}

export default Uint256Oracle
