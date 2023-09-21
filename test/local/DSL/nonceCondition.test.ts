import { expect } from 'chai';
import { nonceCondition, nonceToBit } from '@brink-sdk';  // ensure correct import path

describe('nonceCondition', function () {
  it('should return requireBitUsed primitive when state is USED', function () {
    const nonce = 5;
    const bit = nonceToBit({ nonce });
    const primitives = nonceCondition({type: 'nonce', state: 'USED', nonce });

    expect(primitives.length).to.equal(1);
    expect(primitives[0].functionName).to.equal('requireBitUsed');
    expect(primitives[0].params.bitmapIndex).to.equal(bit.index);
    expect(primitives[0].params.bit).to.equal(bit.value);
  });

  it('should return requireBitNotUsed primitive when state is NOT_USED', function () {
    const nonce = 5;
    const bit = nonceToBit({ nonce });
    const primitives = nonceCondition({type: 'nonce', state: 'NOT_USED', nonce });

    expect(primitives.length).to.equal(1);
    expect(primitives[0].functionName).to.equal('requireBitNotUsed');
    expect(primitives[0].params.bitmapIndex).to.equal(bit.index);
    expect(primitives[0].params.bit).to.equal(bit.value);
  });

  it('should correctly handle nonce of 1', function () {
    const nonce = 1;
    const bit = nonceToBit({ nonce });
    const primitives = nonceCondition({type: 'nonce', state: 'USED', nonce });

    expect(primitives.length).to.equal(1);
    expect(primitives[0].functionName).to.equal('requireBitUsed');
    expect(primitives[0].params.bitmapIndex).to.equal(bit.index);
    expect(primitives[0].params.bit).to.equal(bit.value);
  });

  const edgeCases = [
        // Testing lower boundary with negative nonce value
        { nonce: -1,         expectedError: true },

        // Testing the condition where nonce is zero
        { nonce: 0,          expectedError: true },

        // Smallest valid nonce value
        { nonce: 1,          expectedError: false },

        // Testing nonce just below the 256 boundary
        { nonce: 255,        expectedError: false },

        // Testing nonce right on the 256 boundary to check index increment
        { nonce: 256,        expectedError: false },

        // Testing nonce just above the 256 boundary
        { nonce: 257,        expectedError: false },

        // Testing with a very large nonce to ensure handling of BigInt values
        { nonce: BigInt(2)**BigInt(64), expectedError: false }
    ];

    edgeCases.forEach(testCase => {
        it(`should handle nonce of ${testCase.nonce}`, function () {
            if (testCase.expectedError) {
                expect(() => nonceCondition({ type: 'nonce', state: 'USED', nonce: testCase.nonce })).to.throw();
            } else {
                const bit = nonceToBit({ nonce: testCase.nonce });
                const primitives = nonceCondition({ type: 'nonce', state: 'USED', nonce: testCase.nonce });
                expect(primitives[0].params.bitmapIndex).to.equal(bit.index);
                expect(primitives[0].params.bit).to.equal(bit.value);
            }
        });
    });
});
