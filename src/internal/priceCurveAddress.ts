import { PriceCurveType } from '@brinkninja/types'
import { EthereumJsVm as evm } from '.'

export default async function priceCurveAddress (priceCurve: PriceCurveType): Promise<string> {
  await evm._initVM()
  switch (priceCurve) {
    case 'flat':
      return evm.FlatPriceCurve.address
    case 'linear':
      return evm.LinearPriceCurve.address
    case 'quadratic':
      return evm.QuadraticPriceCurve.address
    default:
      throw new Error(`Invalid price curve: ${priceCurve}`)
  }
}
