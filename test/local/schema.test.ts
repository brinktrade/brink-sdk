import { intentOrArraySchema, intentSegmentSchema, intervalConditionSchema, limitSwapActionSchema, marketSwapActionSchema, nonceConditionSchema, priceConditionSchema, replaySchema, TokenSchema } from "@brink-sdk/intents/DSL/schema";
import { expect } from 'chai';

describe('Brink DSL Schema Tests', () => {
  describe('TokenSchema', () => {
    it('validates a correct Ethereum address', () => {
      const input = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
      const result = TokenSchema.validate(input);
      expect(result.error).to.be.undefined;
    });

    it('accepts a token object', () => {
      const input = {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        standard: "ERC20",
        idsMerkleRoot: "0x0000000000000000000000000000000000000000000000000000000000000000",
        id: 1,
        disallowFlagged: true
      };
      const result = TokenSchema.validate(input);
      expect(result.error).to.be.undefined;
    });
  });

  describe('replaySchema', () => {
    it('validates a correct replay object', () => {
      const input = {
        nonce: 555,
        runs: 'ONCE'
      };
      const result = replaySchema.validate(input);
      expect(result.error).to.be.undefined;
    });

    it('throws error for incorrect runs value', () => {
      const input = {
        nonce: 555,
        runs: 'ALWAYS'
      };
      const result = replaySchema.validate(input);
      expect(result.error).to.not.be.undefined;
    });
  });

  describe('priceConditionSchema', () => {
    it('validates a correct price condition', () => {
      const input = {
        type: 'price',
        operator: 'lt',
        tokenA: {
          address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          decimals: 18,
        },
        tokenB: {
          address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          decimals: 18,

        },
        price: 1400
      };
      const result = priceConditionSchema.validate(input);
      expect(result.error).to.be.undefined;
    });

    it('throws an error when passing an address', () => {
      const input = {
        type: 'price',
        operator: 'lt',
        tokenA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        tokenB: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        price: 1400
      };
      const { error } = priceConditionSchema.validate(input);

      expect(error).to.exist;
      expect(JSON.stringify(error)).to.include('must be of type object');
    });
  });

  describe('nonceConditionSchema', () => {
    it('validates a correct nonce condition', () => {
      const input = {
        type: 'nonce',
        nonce: 123,
        state: 'USED'
      }
      const result = nonceConditionSchema.validate(input);
      expect(result.error).to.be.undefined;
    });
  });

  describe('intervalConditionSchema', () => {
    it('validates a correct interval condition', () => {
      const input = {
        type: 'interval',
        id: '12046233276741889253',
        interval: 1000000,
        startBlock: 19_000_000,
        maxIntervals: 7
      }
      const result = intervalConditionSchema.validate(input);
      expect(result.error).to.be.undefined;
    });
  });

  describe('limitSwapActionSchema', () => {
    it('validates a correct limit swap action', () => {
      const input = {
        type: 'limitSwap',
        id: 123456789,
        tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        tokenInAmount: '7500000000',
        tokenOutAmount: '5500000000000000000'
      }
      const result = limitSwapActionSchema.validate(input);
      expect(result.error).to.be.undefined;
    });
  });

  describe('marketSwapActionSchema', () => {
    it('validates a correct market swap action', () => {
      const input = {
        type: 'marketSwap',
        tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
        tokenInAmount: 7500_000000,
        fee: 1.5,
        owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
      }
      const result = marketSwapActionSchema.validate(input);
      expect(result.error).to.be.undefined;
    });
  });

  describe('intentSegmentSchema', () => {
    it('validates a correct intent segment', () => {
      const input = {
        replay: {
          nonce: 555,
          runs: 'ONCE'
        },
        expiryBlock: 21_000_000,
        conditions: [{
          type: 'price',
          operator: 'lt',
          tokenA: {
            address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
            decimals: 18,
          },
          tokenB: {
            address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
            decimals: 18,

          },
          price: 1400.00
        }],
        actions: [{
          type: 'marketSwap',
          tokenIn: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
          tokenOut: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
          tokenInAmount: 7500_000000,
          fee: 1.5,
          owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
        }]
      };
      const { error } = intentSegmentSchema.validate(input);

      expect(error).to.be.undefined;
    });
  });

  describe('intentOrArraySchema', () => {
    it('validates a correct array of intent segments', () => {
      const input = [
        {
          replay: {
            nonce: 1,
            runs: 'ONCE'
          },
          actions: [{
            type: 'limitSwap',
            tokenIn: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', // WETH
            tokenOut: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
            tokenInAmount: '1000000000000000000',
            tokenOutAmount: '2200000000000000000000',
            id: "12345"
          }]
        },
        {
          replay: {
            nonce: 2,
            runs: 'ONCE'
          },
          actions: [{
            type: 'limitSwap',
            tokenIn: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599', // WBTC
            tokenOut: '0x6B175474E89094C44Da98b954EedeAC495271d0F', //DAI
            tokenInAmount: '1000000000000000000',
            tokenOutAmount: '40000000000000000000000',
            id: "123456"
          }]
        }
      ];
      const result = intentOrArraySchema.validate(input);
      expect(result.error).to.be.undefined;
    });
  })
});

