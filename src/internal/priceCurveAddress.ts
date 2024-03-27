import { PriceCurveType } from '@brinkninja/types'
import { EthereumJsVm as evm } from '.'

export default async function priceCurveAddress (priceCurve: PriceCurveType): Promise<string> {
  await evm._initVM()
  switch (priceCurve) {
    case 'flat':
      return await evm.FlatPriceCurve.getAddress()
    case 'linear':
      return await evm.LinearPriceCurve.getAddress()
    case 'quadratic':
      return await evm.QuadraticPriceCurve.getAddress()
    default:
      throw new Error(`Invalid price curve: ${priceCurve}`)
  }
}
