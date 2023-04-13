// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.5.0;

contract MockUint256Oracle {

  uint _initialValue = 10_000000000000000000;

  function getUint256(bytes memory params) external view returns (uint val) {
    uint p = abi.decode(params, (uint));
    val = _initialValue + p;
  }

}
