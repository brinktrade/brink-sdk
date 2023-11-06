import { expect } from 'chai';
import { marketSwapAction, UniV3Twap, Token } from '../../../src';
import { DAI_TOKEN, USDC_TOKEN, WETH_TOKEN } from "../../helpers/tokens";

describe('marketSwapAction', function () {

  it('should create correct market swap action with provided twapFeePool', function () {
    const primitives = marketSwapAction({
      type: 'marketSwap',
      owner: '0xOwnerAddress',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: 1000000,
      fee: 0.5,
      twapFeePool: 500
    });

    expect(primitives[0].functionName).to.equal('marketSwapExactInput');
    expect(primitives[0].params.signer).to.equal('0xOwnerAddress');
    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_TOKEN.address });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: WETH_TOKEN.address });
    expect(primitives[0].params.tokenInAmount).to.equal(1000000n);
    expect(primitives[0].params.feePercent).to.equal(5000n);
    expect(primitives[0].params.feeMin).to.equal(0n);

    const twap = new UniV3Twap({
      tokenA: new Token({ address: USDC_TOKEN.address }),
      tokenB: new Token({ address: WETH_TOKEN.address }),
      interval: BigInt(60),
      fee: 500,
    });
    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params });
  });

  it('should create correct market swap action without providing twapFeePool', function () {
    const primitives = marketSwapAction({
      type: 'marketSwap',
      owner: '0xOwnerAddress',
      tokenIn: USDC_TOKEN,
      tokenOut: DAI_TOKEN,
      tokenInAmount: 2000000,
      fee: 0.1,
    });

    expect(primitives[0].functionName).to.equal('marketSwapExactInput');
    expect(primitives[0].params.signer).to.equal('0xOwnerAddress');
    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_TOKEN.address });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: DAI_TOKEN.address });
    expect(primitives[0].params.tokenInAmount).to.equal(2000000n);
    expect(primitives[0].params.feePercent).to.equal(1000n);
    expect(primitives[0].params.feeMin).to.equal(0n);

    const twap = new UniV3Twap({
      tokenA: new Token({ address: USDC_TOKEN.address }),
      tokenB: new Token({ address: DAI_TOKEN.address }),
      interval: BigInt(60),
      fee: undefined,
    });
    expect(primitives[0].params.oracle).to.deep.equal({ address: twap.address, params: twap.params });
  });

  it('should create correct market swap action with a non-default twapInterval', function () {
    const primitives = marketSwapAction({
      type: 'marketSwap',
      owner: '0xOwnerAddress',
      tokenIn: WETH_TOKEN,
      tokenOut: DAI_TOKEN,
      tokenInAmount: 1,
      fee: 0.2,
      twapInterval: BigInt(2000),
    });

    expect(primitives[0].functionName).to.equal('marketSwapExactInput');
    expect(primitives[0].params.signer).to.equal('0xOwnerAddress');
    expect(primitives[0].params.tokenIn).to.deep.include({ address: WETH_TOKEN.address });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: DAI_TOKEN.address });
    expect(primitives[0].params.tokenInAmount).to.equal(1n);
    expect(primitives[0].params.feePercent).to.equal(2000n);
    expect(primitives[0].params.feeMin).to.equal(0n);

    const twap = new UniV3Twap({
      tokenA: new Token({ address: WETH_TOKEN.address }),
      tokenB: new Token({ address: DAI_TOKEN.address }),
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
            tokenIn: USDC_TOKEN,
            tokenOut: DAI_TOKEN,
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
