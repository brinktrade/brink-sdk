import {
  toTokenWithDecimalsSchema,
  toTokenSchema,
  intentOrArraySchema,
  singleIntentSchema,
  intervalConditionSchema,
  limitSwapActionSchema,
  marketSwapActionSchema,
  blockIntervalDutchAuctionSwapSchema,
  nonceConditionSchema,
  priceConditionSchema,
  replaySchema,
  TokenSchema
} from "@brink-sdk/intents/DSL/schema";
import { expect } from 'chai';
import { DAI_TOKEN, USDC_TOKEN } from "../helpers/tokens";
import { Declaration } from "@brink-sdk"

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

  describe('toTokenWithDecimalsSchema', () => {
    it('validates a input value and transform to token args', () => {
      const input = USDC_TOKEN.address;

      const { error, value } = toTokenWithDecimalsSchema.validate(input, { context: { chainId: 1 } });

      expect(error).to.be.undefined;
      expect(value).to.deep.equal({
        address: USDC_TOKEN.address,
        decimals: USDC_TOKEN.decimals,
      });
    })
  })

  describe('toTokenSchema', () => {
    it('validates a input value and transform to token args', () => {
      const input = USDC_TOKEN.address;

      const { error, value } = toTokenSchema.validate(input, { context: { chainId: 1 } });

      expect(error).to.be.undefined;
      expect(value).to.deep.equal({
        address: USDC_TOKEN.address,
      });
    });
  })

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
      const result = replaySchema.validate(input, { context: { chainId: 1 } });
      expect(result.error).to.not.be.undefined;
    });
  });

  describe('priceConditionSchema', () => {
    it('validates a correct price condition', () => {
      const input = {
        type: 'price',
        operator: 'lt',
        tokenA: {
          address: USDC_TOKEN.address,
          decimals: USDC_TOKEN.decimals,
        },
        tokenB: {
          address: DAI_TOKEN.address,
          decimals: DAI_TOKEN.decimals,

        },
        price: 1400
      };
      const result = priceConditionSchema.validate(input, { context: { chainId: 1 } });
      expect(result.error).to.be.undefined;
    });

    it('valides a correct price with decimals', () => {
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
        price: 0.5
      };
      const result = priceConditionSchema.validate(input, { context: {chainId: 1 }});
      expect(result.error).to.be.undefined;
    })

    it('validates when passing an address', () => {
      const input = {
        type: 'price',
        operator: 'lt',
        tokenA: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        tokenB: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        price: 1400
      };
      const { error } = priceConditionSchema.validate(input, { context: { chainId: 1 } });

      expect(error).to.be.undefined;
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
        owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
        tokenIn: USDC_TOKEN.address,
        tokenOut: DAI_TOKEN.address,
        tokenInAmount: '7500000000',
        tokenOutAmount: '5500000000000000000'
      }
      const result = limitSwapActionSchema.validate(input, { context: { chainId: 1 } })
      expect(result.error).to.be.undefined;
    });
  });

  describe('marketSwapActionSchema', () => {
    it('validates a correct market swap action', () => {
      const input = {
        type: 'marketSwap',
        tokenIn: USDC_TOKEN.address,
        tokenOut: DAI_TOKEN.address,
        tokenInAmount: 7500_000000,
        fee: 1.5,
        owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
      }
      const result = marketSwapActionSchema.validate(input, { context: { chainId: 1 } });
      expect(result.error).to.be.undefined;
    });
  });

  describe('blockIntervalDutchAuctionSwapSchema', () => {
    it('validates a correct block interval dutch auction swap', () => {
      const input = {
        type: 'blockIntervalDutchAuctionSwap',
        owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
        tokenIn: USDC_TOKEN.address,
        tokenOut: DAI_TOKEN.address,
        tokenInAmount: 500_000000,
        intervalId: 12345,
        firstAuctionStartBlock: 20_000_000,
        auctionInterval: 10_000,
        auctionDuration: 100,
        startPercent: 50,
        endPercent: -50,
        twapFeePool: 3000,
        maxAuctions: 5
      }
      const result = blockIntervalDutchAuctionSwapSchema.validate(input, { context: { chainId: 1 } });
      expect(result.error).to.be.undefined;
    });
  });

  describe('intentSegmentSchema', () => {
    it('validates a correct intent segment', () => {
      const input = {
        chainId: 1,
        replay: {
          nonce: 555,
          runs: 'ONCE'
        },
        expiryBlock: 21_000_000,
        conditions: [{
          type: 'price',
          operator: 'lt',
          tokenA: {
            address: USDC_TOKEN.address,
            decimals: USDC_TOKEN.decimals,
          },
          tokenB: {
            address: DAI_TOKEN.address,
            decimals: DAI_TOKEN.decimals,

          },
          price: 1400.00
        }],
        actions: [{
          type: 'marketSwap',
          tokenIn: USDC_TOKEN.address,
          tokenOut: DAI_TOKEN.address, // WETH
          tokenInAmount: 7500_000000,
          fee: 1.5,
          owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
        }]
      };
      const { error } = singleIntentSchema.validate(input, { context: { chainId: 1 } })
      expect(error).to.be.undefined;
    });
  });

  describe('intentOrArraySchema', () => {
    it('validates a correct array of intent segments', () => {
      const input = {
        chainId: 1, 
        intents: [
          {
            replay: {
              nonce: 1,
              runs: 'ONCE'
            },
            actions: [{
              type: 'limitSwap',
              tokenIn: USDC_TOKEN.address,
              tokenOut: DAI_TOKEN.address,
              tokenInAmount: '1000000000000000000',
              tokenOutAmount: '2200000000000000000000',
              owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
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
              tokenIn: USDC_TOKEN.address,
              tokenOut: DAI_TOKEN.address,
              tokenInAmount: '1000000000000000000',
              tokenOutAmount: '40000000000000000000000',
              owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A',
              id: "123456"
            }]
          }
        ]
      };
      const result = intentOrArraySchema.validate(input, { context: { chainId: 1 } });
      expect(result.error).to.be.undefined;
    });
  })

  describe('error messages', () => {
    it('throws an error for missing params in intent object', () => {
      expect(createDeclartion.bind(null, {
        ...validIntentObj,
        replay: {}
      })).to.throw('"replay.nonce" is required')
    })

    it('throws an error for missing param in a sub-object of the intent object', () => {
      expect(createDeclartion.bind(null, {
        ...validIntentObj,
        conditions: [{
          type: 'price',
          // operator: 'lt',
          tokenA: {
            address: USDC_TOKEN.address,
            decimals: USDC_TOKEN.decimals,
          },
          tokenB: {
            address: DAI_TOKEN.address,
            decimals: DAI_TOKEN.decimals,
      
          },
          price: 1400.00
        }]
      })).to.throw('"conditions[0].operator" is required')
    })

    it('throws an error for missing param in a sub-sub-object of the intent object', () => {
      expect(createDeclartion.bind(null, {
        ...validIntentObj,
        conditions: [{
          type: 'price',
          operator: 'lt',
          tokenA: {
            // address: USDC_TOKEN.address,
            decimals: USDC_TOKEN.decimals,
          },
          tokenB: {
            address: DAI_TOKEN.address,
            decimals: DAI_TOKEN.decimals,
      
          },
          price: 1400.00
        }]
      })).to.throw('"conditions[0].tokenA.address" is required')
    })

    it('throws an error for missing params in a multi-intent object', () => {
      expect(createDeclartion.bind(null, {
        ...validMultiIntentObj,
        intents: [
          validMultiIntentObj.intents[0],
          {
            ...validMultiIntentObj.intents[1],
            replay: {}
          }
        ]
      })).to.throw('"intents[1].replay.nonce" is required')
    })
  })
});

const validIntentObj = {
  chainId: 1,
  replay: {
    nonce: 1,
    runs: 'ONCE'
  },
  expiryBlock: 21_000_000,
  conditions: [{
    type: 'price',
    operator: 'lt',
    tokenA: {
      address: USDC_TOKEN.address,
      decimals: USDC_TOKEN.decimals,
    },
    tokenB: {
      address: DAI_TOKEN.address,
      decimals: DAI_TOKEN.decimals,

    },
    price: 1400.00
  }],
  actions: [{
    type: 'marketSwap',
    tokenIn: USDC_TOKEN.address,
    tokenOut: DAI_TOKEN.address, // WETH
    tokenInAmount: 7500_000000,
    fee: 1.5,
    owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
  }]
}

const validMultiIntentObj = {
  chainId: 1,
  intents: [{
    replay: {
      nonce: 1,
      runs: 'ONCE'
    },
    expiryBlock: 21_000_000,
    conditions: [{
      type: 'price',
      operator: 'lt',
      tokenA: {
        address: USDC_TOKEN.address,
        decimals: USDC_TOKEN.decimals,
      },
      tokenB: {
        address: DAI_TOKEN.address,
        decimals: DAI_TOKEN.decimals,

      },
      price: 1400.00
    }],
    actions: [{
      type: 'marketSwap',
      tokenIn: USDC_TOKEN.address,
      tokenOut: DAI_TOKEN.address, // WETH
      tokenInAmount: 7500_000000,
      fee: 1.5,
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
    }]
  },{
    replay: {
      nonce: 2,
      runs: 'ONCE'
    },
    expiryBlock: 21_000_000,
    conditions: [{
      type: 'price',
      operator: 'lt',
      tokenA: {
        address: USDC_TOKEN.address,
        decimals: USDC_TOKEN.decimals,
      },
      tokenB: {
        address: DAI_TOKEN.address,
        decimals: DAI_TOKEN.decimals,

      },
      price: 1400.00
    }],
    actions: [{
      type: 'marketSwap',
      tokenIn: USDC_TOKEN.address,
      tokenOut: DAI_TOKEN.address,
      tokenInAmount: 7500_000000,
      fee: 1.5,
      owner: '0x6399ae010188F36e469FB6E62C859dDFc558328A'
    }]
  }]
}

function createDeclartion (d: any) {
  return new Declaration(d)
}
