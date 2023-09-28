import { convertToX96HexPrice } from '@brink-sdk/internal/price';
import { expect } from 'chai';
import { limitSwapAction } from '../../../src';

const USDC_ADDRESS = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

describe('limitSwapAction', function () {
  it('should handle token swap with all expected attributes', function () {
    const primitives = limitSwapAction({
      type: 'limitSwap',
      id: BigInt('1'),
      owner: '0xOwnerAddress',
      tokenIn: USDC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      tokenInAmount: 1000000,  // 1 USDC
      tokenOutAmount: 0.01    // 0.01 WETH

    });

    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_ADDRESS });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: WETH_ADDRESS});
    expect(primitives[0].params.tokenInAmount).to.equal(1000000);

    const hexPrice = convertToX96HexPrice(0.01, 1000000);
    const priceCurve  = primitives[0].params.priceCurve as any;
    expect(priceCurve.params).to.equal(hexPrice);

    const fillState = primitives[0].params.fillStateParams as any;
    expect(fillState.id).to.equal(1n);
    expect(fillState.sign).to.be.true;
    expect(fillState.startX96).to.equal(0n);
  });

  it('should throw error if tokenOutAmount is undefined', function () {
    expect(() => limitSwapAction({
      type: 'limitSwap',
      id: BigInt('3'),
      owner: '0xOwnerAddress',
      tokenIn: USDC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      tokenInAmount: 1000000
    })).to.throw('tokenOutAmount is required');
  });
});
