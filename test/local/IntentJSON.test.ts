import { expect } from 'chai'
import {
  Strategy,
  IntentArgs,
  IntentSegmentArgs
} from '@brink-sdk'

describe('IntentArgs', function () {
  describe('IntentArgs object passed to strategy', function () {
    it('should return primitives based on intent object args', async function () {
      const strategy1 = new Strategy(intentObject)
      const strategyJSON = await strategy1.toJSON()
      expect(strategyJSON.orders.length).to.equal(2)
      expect(strategyJSON.orders[0].primitives[0].functionName).to.equal('useBit')
      expect(strategyJSON.orders[0].primitives[1].functionName).to.equal('requireBlockNotMined')
      expect(strategyJSON.orders[0].primitives[2].functionName).to.equal('requireBlockMined')
      expect(strategyJSON.orders[1].primitives[0].functionName).to.equal('useBit')
      expect(strategyJSON.orders[1].primitives[1].functionName).to.equal('requireBlockNotMined')
      expect(strategyJSON.orders[0].primitives[2].functionName).to.equal('requireBlockMined')
    })
  })

  describe('single IntentSegmentArgs passed to strategy', function () {
    it('should return primitives based on intent object args', async function () {
      const strategy1 = new Strategy(singleSegmentIntent)
      const strategyJSON = await strategy1.toJSON()
      expect(strategyJSON.orders.length).to.equal(1)
      expect(strategyJSON.orders[0].primitives[0].functionName).to.equal('useBit')
      expect(strategyJSON.orders[0].primitives[1].functionName).to.equal('requireBlockNotMined')
      expect(strategyJSON.orders[0].primitives[2].functionName).to.equal('requireBlockMined')
    })
  })

  describe('IntentSegmentArgs array passed to strategy', function () {
    it('should return primitives based on intent object args', async function () {
      const strategy1 = new Strategy(multiSegmentIntent)
      const strategyJSON = await strategy1.toJSON()
      expect(strategyJSON.orders.length).to.equal(2)
      expect(strategyJSON.orders[0].primitives[0].functionName).to.equal('useBit')
      expect(strategyJSON.orders[0].primitives[1].functionName).to.equal('requireBlockNotMined')
      expect(strategyJSON.orders[0].primitives[2].functionName).to.equal('requireBlockMined')
      expect(strategyJSON.orders[1].primitives[0].functionName).to.equal('useBit')
      expect(strategyJSON.orders[1].primitives[1].functionName).to.equal('requireBlockNotMined')
      expect(strategyJSON.orders[0].primitives[2].functionName).to.equal('requireBlockMined')
    })
  })
})

const singleSegmentIntent: IntentSegmentArgs = {
  replay: {
    nonce: 123,
    runs: 'ONCE'
  },
  expiryBlock: 21_000_000,
  conditions: [{
    type: 'block',
    state: 'MINED',
    blockNumber: 20_000_000
  }],
  actions: [{
    type: 'marketSwap',
    owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
    tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    tokenInAmount: 15_000,
    feePercent: 2.5
  }]
}

const multiSegmentIntent: IntentSegmentArgs[] = [
  {
    replay: {
      nonce: 123,
      runs: 'ONCE'
    },
    expiryBlock: 21_000_000,
    conditions: [{
      type: 'block',
      state: 'MINED',
      blockNumber: 20_000_000
    }],
    actions: [{
      type: 'marketSwap',
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenInAmount: 15_000,
      feePercent: 2.5
    }]
  },
  {
    replay: {
      nonce: 456,
      runs: 'ONCE'
    },
    expiryBlock: 31_000_000,
    conditions: [{
      type: 'block',
      state: 'MINED',
      blockNumber: 20_000_000
    }],
    actions: [{
      type: 'marketSwap',
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
      tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
      tokenInAmount: 8_000,
      feePercent: 1.7
    }]
  }
]

const intentObject: IntentArgs = {
  segments: multiSegmentIntent
}
