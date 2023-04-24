import { ethers } from 'ethers'
import { Token } from '../strategies'
import Uint256Oracle from './Uint256Oracle'

abstract class TokenPairOracle extends Uint256Oracle {

  tokenA: Token
  tokenB: Token

  constructor (tokenA: Token, tokenB: Token, contractAddress: string, paramsEncoded: string) {
    super(contractAddress, paramsEncoded)
    this.tokenA = tokenA
    this.tokenB = tokenB
  }

  async price (signerOrProvider: ethers.Signer | ethers.providers.Provider): Promise<BigInt> {
    return await this.value(signerOrProvider)
  }

}

export default TokenPairOracle
