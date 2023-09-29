import { expect } from 'chai';
import { limitSwapAction } from '../../../src'; // Assuming your implementation is in this path

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
      tokenInAmount: 1000000,
      tokenOutAmount: 1
    });

    expect(primitives[0].params.tokenIn).to.deep.include({ address: USDC_ADDRESS });
    expect(primitives[0].params.tokenOut).to.deep.include({ address: WETH_ADDRESS});
    expect(primitives[0].params.tokenInAmount).to.equal(1000000);
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
            tokenIn: USDC_ADDRESS,
            tokenOut: WETH_ADDRESS,
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
