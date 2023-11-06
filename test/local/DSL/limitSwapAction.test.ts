import { padLeft } from 'web3-utils'
import { convertToX96HexPrice } from '@brink-sdk/internal';
import { expect } from 'chai';
import { limitSwapAction } from '../../../src'; // Assuming your implementation is in this path
import { USDC_TOKEN, WETH_TOKEN } from "../../helpers/tokens";

describe('limitSwapAction', function () {
  it('should handle token swap with all expected attributes', function () {
    const primitives = limitSwapAction({
      type: 'limitSwap',
      id: BigInt('1'),
      owner: '0xOwnerAddress',
      tokenIn: USDC_TOKEN,
      tokenOut: WETH_TOKEN,
      tokenInAmount: 1000000,
      tokenOutAmount: 1
    });

    expect(primitives[0].functionName).to.equal('limitSwapExactInput')
    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_TOKEN.address });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: WETH_TOKEN.address });
    expect(primitives[0].params.tokenInAmount).to.equal(1000000);
    const priceCurve = primitives[0].params.priceCurve as any;
    const expectedPrice = padLeft(convertToX96HexPrice(1000000n, 1n), 64)
    expect(priceCurve.params).to.equal(expectedPrice);

    const fillStateParams = primitives[0].params.fillStateParams as any;
    expect(fillStateParams.id).to.equal(1n);
    expect(fillStateParams.sign).to.equal(true);
    expect(fillStateParams.startX96).to.equal(0n);
  });

  describe('invalid token amounts', function () {
    const testCases = [
      { tokenInAmount: 1000000, tokenOutAmount: undefined, description: 'tokenOutAmount is undefined' },
      { tokenInAmount: 1000000.5, tokenOutAmount: 2, description: 'tokenInAmount is not an integer' },
      { tokenInAmount: 1000000, tokenOutAmount: 2.01, description: 'tokenOutAmount is not an integer' },
      { tokenInAmount: '1000000.5', tokenOutAmount: 2, description: 'tokenInAmount as string with decimals' },
      { tokenInAmount: 1000000, tokenOutAmount: '2.01', description: 'tokenOutAmount as string with decimals' },
      { tokenInAmount: 'invalidString', tokenOutAmount: 2, description: 'tokenInAmount as invalid string' },
      { tokenInAmount: 1000000, tokenOutAmount: 'invalidString', description: 'tokenOutAmount as invalid string' },
    ];

    testCases.forEach(testCase => {
      it(`should throw InvalidInputError if ${testCase.description}`, function () {
        try {
          limitSwapAction({
            type: 'limitSwap',
            id: BigInt('4'),
            owner: '0xOwnerAddress',
            tokenIn: USDC_TOKEN,
            tokenOut: WETH_TOKEN,
            tokenInAmount: testCase.tokenInAmount,
            tokenOutAmount: testCase.tokenOutAmount
          })
          throw new Error('Expected limitSwapAction to throw an error, but it did not.');
        } catch (error: any) {
            expect(error.name).to.equal('InvalidInputError');
        }
      });
    });
  });
});
