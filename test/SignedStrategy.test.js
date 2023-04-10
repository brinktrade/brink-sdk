const { expect } = require("chai")
const { Strategy } = require('../src/strategies')

describe('SignedStrategy', function () {
  describe('validate()', function () {
    it('should return valid for a valid SignedStrategy', async function () {
      const strategyData = await buildStrategy()
      const signedStrategy = await this.accountSigner.signStrategyEIP712(strategyData)
      expect((await signedStrategy.validate()).valid).to.equal(true)
    })

    it('SignedStrategy where account does not match signer owned account should be invalid', async function () {
      const strategyData = await buildStrategy()
      let signedStrategy = await this.accountSigner.signStrategyEIP712(strategyData)
      signedStrategy.account = '0xddf8ea13c57c53fd259af900aa0e3138c7021e50'
      const validationResult = await signedStrategy.validate()
      expect(validationResult.valid).to.equal(false)
      expect(validationResult.reason).to.equal('ACCOUNT_MISMATCH')
    })

    it('SignedStrategy where hash does not match data should be invalid', async function () {
      const strategyData = await buildStrategy()
      let signedStrategy = await this.accountSigner.signStrategyEIP712(strategyData)
      signedStrategy.hash = signedStrategy.hash.slice(0, -2)
      const validationResult = await signedStrategy.validate()
      expect(validationResult.valid).to.equal(false)
      expect(validationResult.reason).to.equal('HASH_MISMATCH')
    })

    it('SignedStrategy where signer does not match signature recovered address should be invalid', async function () {
      const strategyData = await buildStrategy()
      let signedStrategy = await this.accountSigner.signStrategyEIP712(strategyData)
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
              params: [0, 1]
            },
            {
              functionName: 'marketSwapExactInput',
              params: [
                '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
                '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8',
                '0x6399ae010188F36e469FB6E62C859dDFc558328A',
                [
                  0,
                  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                  0,
                  false
                ],
                [
                  0,
                  '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
                  '0x0000000000000000000000000000000000000000000000000000000000000000',
                  0,
                  false
                ],
                1450000000,
                10000,
                0
              ]
            }
          ]
        }
      ]
    }
  )
  return await strategy1.toJSON()
}
