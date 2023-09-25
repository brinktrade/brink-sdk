import { expect } from 'chai'
import { nonceToBit } from '@brink-sdk'

describe('nonceToBit', () => {
  it('should correctly convert nonce to bit for 0 index', () => {
    const bit = nonceToBit({ nonce: 5 })
    expect(bit.index).to.equal(0n)
    expect(bit.value).to.equal(BigInt(2**4))
  })

  it('should correctly convert nonce to bit for greater than 0 index', () => {
    const nonce = 258
    const bit = nonceToBit({ nonce })
    expect(bit.index).to.equal(1n)
    expect(bit.value).to.equal(BigInt(2**1))
  })

  it('should error if nonce is 0', () => {
    expect(() => nonceToBit({ nonce: 0 })).to.throw('Nonce should be greater than 0')
  })

  const edgeCases = [
    // Testing lower boundary with negative nonce value
    { nonce: -1, expectedError: true },

    // Testing the condition where nonce is zero
    { nonce: 0, expectedError: true },

    // Smallest valid nonce value
    { nonce: 1, expectedError: false, expectedIndex: 0n, expectedValue: BigInt(2**0) },

    // Testing nonce just below the 256 boundary
    { nonce: 255, expectedError: false, expectedIndex: 0n, expectedValue: BigInt(2**254) },

    // Testing nonce right on the 256 boundary to check index increment
    { nonce: 256, expectedError: false, expectedIndex: 0n, expectedValue: BigInt(2**255) },

    // Testing nonce just above the 256 boundary
    { nonce: 257, expectedError: false, expectedIndex: 1n, expectedValue: BigInt(2**0) },
    { nonce: 1000, expectedError: false, expectedIndex: 3n, expectedValue: BigInt(2**231) },
  ];

  edgeCases.forEach(testCase => {
    it(`should handle nonce of ${testCase.nonce}`, function () {
      if (testCase.expectedError) {
        expect(() => nonceToBit({ nonce: testCase.nonce })).to.throw();
      } else {
        const bit = nonceToBit({ nonce: testCase.nonce });

        expect(bit).to.be.an('object');
        expect(bit).to.have.property('index');
        expect(bit.index).to.be.a('bigint');
        expect(bit.index).to.equal(testCase.expectedIndex);
        expect(bit).to.have.property('value');
        expect(bit.value).to.be.a('bigint');
        expect(bit.value).to.equal(testCase.expectedValue);
      }
    });
  });
})
