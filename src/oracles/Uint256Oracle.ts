import Oracle from './Oracle'
import readUint256Oracle from './readUint256Oracle'
import { EthersProviderOrSigner } from '../Types'

abstract class Uint256Oracle extends Oracle {

  constructor (contractAddress: string, paramsEncoded: string) {
    super(contractAddress, paramsEncoded)
  }

  async value (signerOrProvider: EthersProviderOrSigner): Promise<BigInt> {
    return await readUint256Oracle(signerOrProvider, this.contractAddress, this.paramsEncoded)
  }

}

export default Uint256Oracle
