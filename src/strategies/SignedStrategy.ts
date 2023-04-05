import Strategy from './Strategy'
import { SignedStrategyData, StrategyData, SignatureType } from './StrategyTypes'
import evm from './StrategiesEVM'

class SignedStrategy {
  account: string
  chainId: BigInt
  signatureType: SignatureType
  strategy: Strategy
  signature: string

  constructor(signedStrategyData: SignedStrategyData) {
    this.account = signedStrategyData.account
    this.chainId = signedStrategyData.chainId
    this.signatureType = signedStrategyData.signatureType
    this.strategy = new Strategy(signedStrategyData.strategy)
    this.signature = signedStrategyData.signature
  }

  // async toJSON (): Promise<SignedStrategyData> {
  //   const strategyData: StrategyData = await this.strategy.toJSON()

  //   const hash = await evm.strategyMessageHash(
  //     this.signatureType,
  //     strategyData.data as string,
  //     this.account,
  //     this.chainId
  //   )

  //   return {
  //     strategy: strategyData,
  //     hash,
  //     account: this.account,
  //     chainId: this.chainId,
  //     signatureType: this.signatureType,
  //     signature: this.signature
  //   }
  // }

}

export default SignedStrategy
