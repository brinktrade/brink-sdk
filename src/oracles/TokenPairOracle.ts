import { Token } from '../strategies'
import { CallData } from '../Types'
import Uint256Oracle from './Uint256Oracle'

export type TokenPairOracleConstructorArgs = {
  tokenA: Token
  tokenB: Token
  address: string
  params: string
}

abstract class TokenPairOracle extends Uint256Oracle {

  tokenA: Token
  tokenB: Token

  constructor ({
    tokenA,
    tokenB,
    address,
    params
  }: TokenPairOracleConstructorArgs) {
    super({ address, params })
    this.tokenA = tokenA
    this.tokenB = tokenB
  }

  async price (): Promise<CallData> {
    return await this.read()
  }

}

export default TokenPairOracle
