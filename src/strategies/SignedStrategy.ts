import Strategy from './Strategy'
import { SignedStrategyData, SignatureType } from './StrategyTypes'
import Config from '../Config'

class SignedStrategy {
  account: string
  chainId: BigInt
  signatureType: SignatureType
  strategy: Strategy
  signature: string
  strategyContract: string

  constructor(signedStrategyData: SignedStrategyData) {
    this.account = signedStrategyData.account
    this.chainId = signedStrategyData.chainId
    this.signatureType = signedStrategyData.signatureType
    this.strategy = new Strategy(signedStrategyData.strategy)
    this.signature = signedStrategyData.signature
    this.strategyContract = Config.get('STRATEGY_CONTRACT') as string
  }
}

export default SignedStrategy
