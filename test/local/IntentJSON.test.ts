import { expect } from 'chai'
import {
  Declaration,
  DeclarationDefinitionArgs,
  IntentDefinitionArgs
} from '@brink-sdk'

describe('DeclarationDefinitionArgs', function () {
  describe('DeclarationDefinitionArgs object passed to declaration', function () {
    it('should return segments based on intent object args', async function () {
      const declaration1 = new Declaration(intentObject)
      const declarationJSON = await declaration1.toJSON()
      expect(declarationJSON.intents.length).to.equal(2)
      expect(declarationJSON.intents[0].segments[0].functionName).to.equal('useBit')
      expect(declarationJSON.intents[0].segments[1].functionName).to.equal('requireBlockNotMined')
      expect(declarationJSON.intents[0].segments[2].functionName).to.equal('requireBlockMined')
      expect(declarationJSON.intents[1].segments[0].functionName).to.equal('useBit')
      expect(declarationJSON.intents[1].segments[1].functionName).to.equal('requireBlockNotMined')
      expect(declarationJSON.intents[0].segments[2].functionName).to.equal('requireBlockMined')
    })
  })

  describe('single IntentDefinitionArgs passed to declaration', function () {
    it('should return segments based on intent object args', async function () {
      const declaration1 = new Declaration(singleSegmentIntent)
      const declarationJSON = await declaration1.toJSON()
      expect(declarationJSON.intents.length).to.equal(1)
      expect(declarationJSON.intents[0].segments[0].functionName).to.equal('useBit')
      expect(declarationJSON.intents[0].segments[1].functionName).to.equal('requireBlockNotMined')
      expect(declarationJSON.intents[0].segments[2].functionName).to.equal('requireBlockMined')
    })
  })

  describe('IntentDefinitionArgs array passed to declaration', function () {
    it('should return segments based on intent object args', async function () {
      const declaration1 = new Declaration(multiSegmentIntent)
      const declarationJSON = await declaration1.toJSON()
      expect(declarationJSON.intents.length).to.equal(2)
      expect(declarationJSON.intents[0].segments[0].functionName).to.equal('useBit')
      expect(declarationJSON.intents[0].segments[1].functionName).to.equal('requireBlockNotMined')
      expect(declarationJSON.intents[0].segments[2].functionName).to.equal('requireBlockMined')
      expect(declarationJSON.intents[1].segments[0].functionName).to.equal('useBit')
      expect(declarationJSON.intents[1].segments[1].functionName).to.equal('requireBlockNotMined')
      expect(declarationJSON.intents[0].segments[2].functionName).to.equal('requireBlockMined')
    })
  })
})

const singleSegmentIntent: IntentDefinitionArgs = {
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

const multiSegmentIntent: IntentDefinitionArgs[] = [
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

const intentObject: DeclarationDefinitionArgs = {
  intents: multiSegmentIntent
}
