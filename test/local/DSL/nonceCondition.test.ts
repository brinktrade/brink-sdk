import { expect } from 'chai';
import { nonceCondition, nonceToBit } from '@brink-sdk';  // ensure correct import path

describe('nonceCondition', function () {
  it('should return requireBitUsed primitive when state is USED', function () {
    const nonce = 5;
    const bit = nonceToBit({ nonce });
    const primitives = nonceCondition({type: 'nonce', state: 'USED', nonce });

    expect(primitives.length).to.equal(1);
    expect(primitives[0].functionName).to.equal('requireBitUsed');
    expect(primitives[0].params.index).to.equal(bit.index.toString());
    expect(primitives[0].params.value).to.equal(bit.value.toString());
  });

  it('should return requireBitNotUsed primitive when state is NOT_USED', function () {
    const nonce = 5;
    const bit = nonceToBit({ nonce });
    const primitives = nonceCondition({type: 'nonce', state: 'NOT_USED', nonce });

    expect(primitives.length).to.equal(1);
    expect(primitives[0].functionName).to.equal('requireBitNotUsed');
    expect(primitives[0].params.index).to.equal(bit.index.toString());
    expect(primitives[0].params.value).to.equal(bit.value.toString());
  });
});
