import Oracle from './Oracle'
import readUint256Oracle from './readUint256Oracle'
import { CallData } from '../Types'

abstract class Uint256Oracle extends Oracle {

  constructor (contractAddress: string, paramsEncoded: string) {
    super(contractAddress, paramsEncoded)
  }

  async read (): Promise<CallData> {
    return await readUint256Oracle({
      oracleAddress: this.contractAddress,
      oracleParams: this.paramsEncoded
    })
  }

}

export default Uint256Oracle
