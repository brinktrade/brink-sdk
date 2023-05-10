import { expect } from 'chai'
import { Strategy, Token, PrimitiveJSON } from '@brink-sdk'

describe('SignedStrategy', function () {
  describe('validate()', function () {
    it('should return valid for a valid SignedStrategy', async function () {
      const strategyData = await buildStrategy()
      const signedStrategy = await this.signStrategy(strategyData)
      expect((await signedStrategy.validate()).valid).to.equal(true)
    })

    it('SignedStrategy where signer does not match signature recovered address should be invalid', async function () {
      const strategyData = await buildStrategy()
      let signedStrategy = await this.signStrategy(strategyData)
      signedStrategy.signature = '0xa6d6160d57568bde2a1ca2f623cf8814e06d75ee174389e5325110f7029311c2192404dc20a07e9b71cc8747102612c081b4c20ed4f16b37cb3980dd7bd8df1c1b'
      const validationResult = await signedStrategy.validate()
      expect(validationResult.valid).to.equal(false)
      expect(validationResult.reason).to.equal('SIGNATURE_MISMATCH')
    })
  })
})

async function buildStrategy () {
  const strategy1 = new Strategy(
    {
      orders: [
        {
          primitives: [
            {
              functionName: 'useBit',
              params: {
                bitmapIndex: BigInt(0),
                bit: BigInt(1)
              }
            } as PrimitiveJSON,
            {
              functionName: 'marketSwapExactInput',
              params: {
                oracle: {
                  address: '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
                  params: '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8'
                },
                signer: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
                tokenIn: new Token({ address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' }),
                tokenOut: new Token({ address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2' }),
                tokenInAmount: BigInt(1450000000),
                feePercent: BigInt(10000),
                feeMin: BigInt(0)
              }
            } as PrimitiveJSON
          ]
        }
      ]
    }
  )
  return await strategy1.toJSON()
}
