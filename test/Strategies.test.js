const { expect } = require('chai')
const { Strategy, Order, UseBit } = require('../src/strategies')
const { default: MarketSwapExactInput } = require('../src/strategies/Primitives/MarketSwapExactInput')

describe('Strategies', function () {
  it('should build basic strategy and convert to JSON', async function () {
    const strategy1 = new Strategy(validStrategy1)
    const strategyJSON = await strategy1.toJSON()
    expect(strategyJSON.orders.length).to.equal(1)
    expect(strategyJSON.orders[0].primitives.length).to.equal(4)
  })

  describe('validate()', function () {
    it('should return valid for valid strategy', async function () {
      const strategy = new Strategy(validStrategy1)
      expect(strategy.validate().valid).to.be.true
    })

    it('empty strategy should be invalid', async function () {
      const strategy = new Strategy()
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('ZERO_ORDERS')
    })

    it('order with more than one swap should be invalid', function () {
      const strategy = new Strategy()
      strategy.orders[0] = new Order()
      strategy.orders[0].primitives[0] = marketSwapExactInput1
      strategy.orders[0].primitives[1] = marketSwapExactInput1
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })

    it('order with zero swaps should be invalid', function () {
      const strategy = new Strategy()
      strategy.orders[0] = new Order()
      strategy.orders[0].primitives[0] = new UseBit(0, 1)
      expect(strategy.validate().valid).to.be.false
      expect(strategy.validate().reason).to.equal('WRONG_NUMBER_OF_SWAPS')
    })
  })
})

const marketSwapExactInput1_Params = [
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

const marketSwapExactInput1 = new MarketSwapExactInput(
  marketSwapExactInput1_Params[0],
  marketSwapExactInput1_Params[1],
  marketSwapExactInput1_Params[2],
  marketSwapExactInput1_Params[3],
  marketSwapExactInput1_Params[4],
  marketSwapExactInput1_Params[5],
  marketSwapExactInput1_Params[6],
  marketSwapExactInput1_Params[7]
)

const validStrategy1 = {
  orders: [
    {
      primitives: [
        {
          functionName: 'useBit',
          params: [0, 1]
        },
        {
          functionName: 'requireBlockNotMined',
          params: [169832100000000]
        },
        {
          functionName: 'requireUint256LowerBound',
          params: [
            '0x3b28d6ee052b65Ed4d5230c1B2A9AbaEF031C648',
            '0x00000000000000000000000088e6a0c2ddd26feeb64f039a2c41296fcb3f564000000000000000000000000000000000000000000000000000000000000003e8',
            (BigInt(1000) * BigInt(2)**BigInt(96)).toString()
          ]
        },
        {
          functionName: 'marketSwapExactInput',
          params: marketSwapExactInput1_Params
        }
      ]
    }
  ]
}

// takes JSON input

// import { Order, Primitive, Strategy } from '@brinkninja/types' 

// // takes JSON input without bytesdata
// const strategy1 = new Strategy({
//   orders: [
//     [
//       {
//         function: 'useBit',
//         params: [1, 2**5]
//       },
//       {
//         function: 'marketSwapExactInput',
//         params: [...]
//       },
//     ]
//   ],
//   beforeCalls: [],
//   afterCalls: []
// })

// // or build from object types
// const strategy2 = new Strategy()
// strategy2.orders[0] = new Order()
// strategy2.orders[0].primitives[0] = new Primitive('useBit', 1, 2**5)
// strategy2.orders[0].primitives[0] = new Primitive('marketSwapExactInput', ...)

// // outputs a JSON representation of the strategy, with bytesdata included
// console.log(strategy1.toJSON())
// console.log(strategy2.toJSON())