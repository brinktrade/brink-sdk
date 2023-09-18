import { PrimitiveArgs } from '@brinkninja/types'
import { MarketSwapActionArgs } from '@brink-sdk'

function marketSwapAction ({
  owner,
  tokenIn,
  tokenOut,
  tokenInAmount,
  feePercent,
  feeMinTokenOut
}: MarketSwapActionArgs): PrimitiveArgs[] {
  if (!feeMinTokenOut) {
    feeMinTokenOut = 0
  }

  // TODO: implement this. will have to handle TwapOracle

  // {
  //   functionName: 'marketSwapExactInput',
  //   params: {
  //     oracle: {
  //       address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
  //       params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
  //     },
  //     signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
  //     tokenIn: { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' } as TokenArgs,
  //     tokenOut: { address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' } as TokenArgs,
  //     tokenInAmount: BigInt(1450000000),
  //     feePercent: BigInt(10000),
  //     feeMin: BigInt(0)
  //   }
  // }

  return []
}

export default marketSwapAction
