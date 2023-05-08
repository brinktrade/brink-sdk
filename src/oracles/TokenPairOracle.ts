import { ethers } from 'ethers'
import { Token } from '../strategies'
import { CallData } from '../Types'
import Uint256Oracle from './Uint256Oracle'

abstract class TokenPairOracle extends Uint256Oracle {

  tokenA: Token
  tokenB: Token

  constructor (tokenA: Token, tokenB: Token, contractAddress: string, paramsEncoded: string) {
    super(contractAddress, paramsEncoded)
    this.tokenA = tokenA
    this.tokenB = tokenB
  }

  async price (): Promise<CallData> {
    return await this.read()
  }

}

export default TokenPairOracle
