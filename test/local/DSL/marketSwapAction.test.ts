import { expect } from 'chai';
import { marketSwapAction, UniV3Twap, Token } from '../../../src';

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const DAI_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F';

describe('marketSwapAction', function () {

  it('should create correct market swap action with provided twapFeePool', function () {
    const primitives = marketSwapAction({
      type: 'marketSwap',
      owner: '0xOwnerAddress',
      tokenIn: USDC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      tokenInAmount: 1000000,
      fee: 0.5,
      twapFeePool: 500
    });

    expect(primitives[0].functionName).to.equal('marketSwapExactInput');
    expect(primitives[0].params.signer).to.equal('0xOwnerAddress');
    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_ADDRESS });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: WETH_ADDRESS });
    expect(primitives[0].params.tokenInAmount).to.equal(1000000n);
    expect(primitives[0].params.feePercent).to.equal(5000n);
    expect(primitives[0].params.feeMin).to.equal(0n);

    const twap = new UniV3Twap({
      tokenA: new Token({ address: USDC_ADDRESS }),
      tokenB: new Token({ address: WETH_ADDRESS }),
      interval: BigInt(60),
      fee: 500,
    });
    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params });
  });

  it('should create correct market swap action without providing twapFeePool', function () {
    const primitives = marketSwapAction({
      type: 'marketSwap',
      owner: '0xOwnerAddress',
      tokenIn: USDC_ADDRESS,
      tokenOut: DAI_ADDRESS,
      tokenInAmount: 2000000,
      fee: 0.1,
    });

    expect(primitives[0].functionName).to.equal('marketSwapExactInput');
    expect(primitives[0].params.signer).to.equal('0xOwnerAddress');
    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_ADDRESS });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: DAI_ADDRESS });
    expect(primitives[0].params.tokenInAmount).to.equal(2000000n);
    expect(primitives[0].params.feePercent).to.equal(1000n);
    expect(primitives[0].params.feeMin).to.equal(0n);

    const twap = new UniV3Twap({
      tokenA: new Token({ address: USDC_ADDRESS }),
      tokenB: new Token({ address: DAI_ADDRESS }),
      interval: BigInt(60),
      fee: undefined,
    });
    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params });
  });

  it('should create correct market swap action with a non-default twapInterval', function () {
    const primitives = marketSwapAction({
      type: 'marketSwap',
      owner: '0xOwnerAddress',
      tokenIn: WETH_ADDRESS,
      tokenOut: DAI_ADDRESS,
      tokenInAmount: 1,
      fee: 0.2,
      twapInterval: BigInt(2000),
    });

    expect(primitives[0].functionName).to.equal('marketSwapExactInput');
    expect(primitives[0].params.signer).to.equal('0xOwnerAddress');
    expect(primitives[0].params.tokenIn).to.deep.include({ address: WETH_ADDRESS });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: DAI_ADDRESS });
    expect(primitives[0].params.tokenInAmount).to.equal(1n);
    expect(primitives[0].params.feePercent).to.equal(2000n);
    expect(primitives[0].params.feeMin).to.equal(0n);

    const twap = new UniV3Twap({
      tokenA: new Token({ address: WETH_ADDRESS }),
      tokenB: new Token({ address: DAI_ADDRESS }),
      interval: BigInt(2000),
      fee: undefined,
    });
    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params });
  });

  describe('invalid input cases', function () {
    const testCases = [
      { tokenInAmount: 'invalidString', fee: 0.2, description: 'tokenInAmount as invalid string' },
      { tokenInAmount: -1000, fee: 0.2, description: 'negative tokenInAmount' },
      { tokenInAmount: 1000000, fee: -0.1, description: 'negative fee' },
    ];

    testCases.forEach(testCase => {
      it(`should throw error if ${testCase.description}`, function () {
        try {
          marketSwapAction({
            type: 'marketSwap',
            owner: '0xOwnerAddress',
            tokenIn: USDC_ADDRESS,
            tokenOut: DAI_ADDRESS,
            tokenInAmount: testCase.tokenInAmount,
            fee: testCase.fee
          });
          throw new Error('Expected marketSwapAction to throw an error, but it did not.');
        } catch (error: any) {
          expect(error).to.exist;
        }
      });
    });
  });
});
