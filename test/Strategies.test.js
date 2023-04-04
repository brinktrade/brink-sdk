const { Strategy, Order, UseBit } = require('../src/strategies')

describe('Strategies', function () {
  it('should do a thing', async function () {
    await this.strategies.useBit(1, 2**5)
  })

  it.only('build basic strategy', async function () {
    const strategy1 = new Strategy(
      {
        account: '0x7A2C00eC3e3F6e8229AE5b1D9F31F0328d24D0FC',
        chainId: 1,
        signatureType: 'EIP712',
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
    console.log()
    console.log('strategy: ', JSON.stringify(await strategy1.toJSON(), null, 2))
    // console.log('strategy.orders[0]: ', JSON.stringify(await strategy1.orders[0].toJSON(), null, 2))
    // console.log('strategy.orders[0].primitives[0]: ', JSON.stringify(await strategy1.orders[0].primitives[0].toJSON(), null, 2))
  })
})

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