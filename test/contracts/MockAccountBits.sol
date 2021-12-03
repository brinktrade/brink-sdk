// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity =0.8.10;
pragma abicoder v1;

contract MockAccountBits {
  uint256 constant INITIAL_BMP_PTR = 
  48874093989078844336340380824760280705349075126087700760297816282162649029611;

  function bitmapPtr (uint256 bitmapIndex) internal pure returns (bytes32) {
    return bytes32(INITIAL_BMP_PTR + bitmapIndex);
  }

  function __mockBitmap(uint256 bitmapIndex, uint256 mockBitmap) public {
    bytes32 ptr = bitmapPtr(bitmapIndex);
    assembly {
      sstore(ptr, mockBitmap)
    }
  }
}