const { Strategy, Order, UseBit } = require('../src/strategies')

describe('Strategies', function () {
  it('should do a thing', async function () {
    await this.strategies.useBit(1, 2**5)
  })

  it.only('build basic strategy', async function () {
    const strategy1 = new Strategy({
      orders: [
        {
          primitives: [
            {
              functionName: 'useBit',
              params: [1, 2**5]
            }
          ]
        }
      ]
    })

    console.log('STRATEGY1: ')
    console.log(JSON.stringify(await strategy1.toJSON(), null, 2))

    // const strategy2 = new Strategy()
    // strategy2.orders[0] = new Order({
    //   primitives: [
    //     {
    //       functionName: 'useBit',
    //       params: [1, 2**5]
    //     }
    //   ]
    // })
    // console.log('STRATEGY2: ')
    // console.log(JSON.stringify(strategy2.toJSON(), null, 2))

    // const strategy3 = new Strategy()
    // strategy3.orders[0] = new Order()
    // strategy3.orders[0].primitives[0] = new Primitive({
    //   functionName: 'useBit',
    //   params: [1, 2**5]
    // })
    // console.log('STRATEGY3: ')
    // console.log(JSON.stringify(strategy3.toJSON(), null, 2))
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