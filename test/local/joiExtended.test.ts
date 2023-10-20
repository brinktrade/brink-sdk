import { joi } from '@brink-sdk/internal';
import { expect } from 'chai';

describe('ethereumAddress', () => {
  const schema = joi.ethereumAddress();

  it('validates a correct Ethereum address', () => {
    const input = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
    const { error } = schema.validate(input);
    expect(error).to.be.undefined;
  });

  it('fails for an incorrect Ethereum address', () => {
    const input = "0x000000";
    const { error } = schema.validate(input);
    expect(error).to.exist;
    expect(JSON.stringify(error)).to.include('ethereumAddress.base');
  });

  it('fails for a non-string Ethereum address', () => {
    const input = 12345678;
    const { error } = schema.validate(input);
    expect(error).to.exist;
    console.log(error)
    expect(JSON.stringify(error)).to.include('must be a string');
  });
});

describe('bigIntish', () => {
  const schema = joi.bigIntish();

  it('validates correct bigIntish', () => {
    const inputs = [
      "1234567890",
      1234567890,
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ];

    for (let input of inputs) {
      const { error } = schema.validate(input);
      expect(error).to.be.undefined;
    }
  });

  const invalidCases = [
    { input: "abcd", matcher: 'bigIntish.base' },
    { input: {}, matcher: 'must be one of [string, number]' },
    { input: [], matcher: 'must be one of [string, number]' },
    { input: null, matcher: 'must be one of [string, number]' },
  ]

  invalidCases.forEach(({ input, matcher }) => {
    it(`fails for incorrect bigIntish: ${input}`, () => {
      const { error } = schema.validate(input);
      expect(error).to.exist;
      console.log(error)
      expect(JSON.stringify(error)).to.include(matcher);
    });
  });

  it('passes for bigIntish with min value', () => {
    const schemaWithMin = joi.bigIntish().min(1000);
    const input = 1500;
    const { error } = schemaWithMin.validate(input);
    expect(error).to.be.undefined;
  });

  it('fails for bigIntish below min value', () => {
    const schemaWithMin = joi.bigIntish().min(1000);
    const input = 500;
    const { error } = schemaWithMin.validate(input);
    expect(error).to.exist;
  });

  it('passes for bigIntish within specified range', () => {
    const schemaWithRange = joi.bigIntish().min(1000).max(5000);
    const input = 3000;
    const { error } = schemaWithRange.validate(input);
    expect(error).to.be.undefined;
  });

  it('fails for bigIntish outside specified range', () => {
    const schemaWithRange = joi.bigIntish().min(1000).max(5000);
    const inputs = [6000, 800];

    for (let input of inputs) {
      const { error } = schemaWithRange.validate(input);
      expect(error).to.exist;
    }
  });
});

describe('uint', () => {
  it('validates correct uint without size specified', () => {
    const schema = joi.uint();
    const inputs = [
      "0",
      "1234567890",
      (BigInt(2**256)-1n).toString(),
    ];

    for (let input of inputs) {
      const { error } = schema.validate(input);
      expect(error).to.be.undefined;
    }
  });

  const invalidCases = [
    { input: (BigInt(2**256)+1n).toString(), errorKey: 'uint.range' },
    { input: "abcd", errorKey: 'bigIntish.base' },
    { input: -1, errorKey: 'uint.range' },
  ]

  invalidCases.forEach(({ input, errorKey }) => {
    it(`fails for incorrect uint without size specified: ${input}`, () => {
      const schema = joi.uint();
      const { error } = schema.validate(input);
      expect(error).to.exist;
      expect(JSON.stringify(error)).to.contain(errorKey);
    });
  });

  it('validates uint with size specified', () => {
    const schema = joi.uint(32); // 2^32 = 4294967296, so max valid value = 4294967295
    const inputs = [
      "0",
      "1234567890",
      "4294967295"
    ];

    for (let input of inputs) {
      const { error } = schema.validate(input);
      expect(error).to.be.undefined;
    }
  });

  it('fails for uint exceeding size specified', () => {
    const schema = joi.uint(32);
    const input = "4294967296"; // One more than 2^32
    const { error } = schema.validate(input);
    expect(error).to.exist;
    expect(JSON.stringify(error)).to.contain("uint.range");
  });
});
