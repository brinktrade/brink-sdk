import Token from '../Token'
import Oracle from './Oracle'

abstract class TokenPairOracle extends Oracle {

  tokenA: Token
  tokenB: Token

  constructor (tokenA: Token, tokenB: Token, contractAddress: string, paramsEncoded: string) {
    super(contractAddress, paramsEncoded)
    this.tokenA = tokenA
    this.tokenB = tokenB
  }

}

export default TokenPairOracle
