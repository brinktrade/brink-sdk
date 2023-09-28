import { expect } from 'chai';
import { nonceCondition, nonceToBit } from '@brink-sdk';  // ensure correct import path

describe('nonceCondition', function () {
  it('should return requireBitUsed segment when state is USED', function () {
    const nonce = 5;
    const bit = nonceToBit({ nonce });
    const segments = nonceCondition({type: 'nonce', state: 'USED', nonce });

    expect(segments.length).to.equal(1);
    expect(segments[0].functionName).to.equal('requireBitUsed');
    expect(segments[0].params.index).to.equal(bit.index.toString());
    expect(segments[0].params.value).to.equal(bit.value.toString());
  });

  it('should return requireBitNotUsed segment when state is NOT_USED', function () {
    const nonce = 5;
    const bit = nonceToBit({ nonce });
    const segments = nonceCondition({type: 'nonce', state: 'NOT_USED', nonce });

    expect(segments.length).to.equal(1);
    expect(segments[0].functionName).to.equal('requireBitNotUsed');
    expect(segments[0].params.index).to.equal(bit.index.toString());
    expect(segments[0].params.value).to.equal(bit.value.toString());
  });
});
