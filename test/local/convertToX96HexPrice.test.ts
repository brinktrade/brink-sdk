import { convertToX96HexPrice } from '@brink-sdk/internal';
import { expect } from 'chai';

describe('Utils', () => {

  describe('convertToX96HexPrice', () => {
    
    // Simple Cases
    it('should convert 200/100 correctly', () => {
      const result = convertToX96HexPrice(200n, 100n);
      // 200 divided by 100 is 2. Then 2 multiplied by 2^96 is a known bigint, converted to hex
      expect(result).to.equal('0x2000000000000000000000000'); 
    });

    it('should convert 300/100 correctly', () => {
      const result = convertToX96HexPrice(300n, 100n);
      // 300 divided by 100 is 3. Then 3 multiplied by 2^96 is a known bigint, converted to hex
      expect(result).to.equal('0x3000000000000000000000000');
    });

    // Edge Cases
    it('should convert 1/1 correctly', () => {
      const result = convertToX96HexPrice(1n, 1n);
      // 1 divided by 1 is 1. Then 1 multiplied by 2^96 is 2^96, converted to hex
      expect(result).to.equal('0x1000000000000000000000000');
    });

    it('should convert 200/1 correctly', () => {
      const result = convertToX96HexPrice(200n, 1n);
      // 200 multiplied by 2^96 is a known bigint, converted to hex
      expect(result).to.equal('0xc8000000000000000000000000');
    });

    // Big Number Handling
    it('should handle big numbers correctly', () => {
      const bigNumber = 10n**12n; // a trillion
      const result = convertToX96HexPrice(bigNumber, 1n);
      const expectedValue = BigInt(bigNumber) * BigInt(2**96);
      expect(result).to.equal('0x' + expectedValue.toString(16));
    });

    // Division by zero
    it('should throw error for division by zero', () => {
      expect(() => convertToX96HexPrice(200n, 0n)).to.throw("Division by zero");
    });
  });
  
});
