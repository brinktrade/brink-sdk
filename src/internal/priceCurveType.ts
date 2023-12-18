import { PriceCurveType } from '@brinkninja/types'

export default function priceCurveType (priceCurveAddress: string): PriceCurveType {
  switch (priceCurveAddress.toLowerCase()) {
    case '0xc509733b8dddbab9369a96f6f216d6e59db3900f':
      return 'flat'
    default:
      throw new Error(`Invalid price curve address: ${priceCurveAddress}`)
  }
}
