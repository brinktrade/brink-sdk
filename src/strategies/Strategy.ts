import { StrategyData, PrimitiveStruct, SignatureType, SignatureTypeEnum } from './StrategyTypes'
import Order from './Order'
import evm from './StrategiesEVM'

class Strategy {
  account?: string
  chainId: BigInt = BigInt(1)
  signatureType: SignatureType = 'EIP712'
  orders: Order[] = []
  beforeCalls: any[] = []
  afterCalls: any[] = []

  constructor(
    strategyData: StrategyData | undefined) {
    if (strategyData) {
      this.fromJSON(strategyData)
    }
  }

  fromJSON (strategyData: StrategyData) {
    this.account = strategyData.account
    this.chainId = strategyData.chainId as BigInt
    this.signatureType = strategyData.signatureType as SignatureType
    this.orders = strategyData.orders.map(orderData => new Order(orderData))
  }

  async toJSON (): Promise<StrategyData> {
    const orders = await Promise.all(
      this.orders.map(async order => await order.toJSON())
    )

    const strategyData = await evm.strategyData(
      orders,
      this.beforeCalls,
      this.afterCalls
    )

    const hash = await evm.strategyMessageHash(
      this.signatureType,
      strategyData,
      this.account as string,
      this.chainId
    )

    return {
      data: strategyData,
      hash,
      account: this.account,
      chainId: this.chainId,
      signatureType: this.signatureType,
      orders,
      beforeCalls: this.beforeCalls,
      afterCalls: this.afterCalls
    }
  }

}

export default Strategy
