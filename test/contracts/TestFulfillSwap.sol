// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity =0.8.10;
pragma abicoder v1;

import "./IERC20.sol";

contract TestFulfillSwap {
  function fulfillTokenOutSwap(IERC20 tokenOut, uint tokenOutAmount, address account) external payable {
    tokenOut.transfer(account, tokenOutAmount);
  }

  function fulfillEthOutSwap(uint ethOutAmount, address account) external {
    bool success;
    (success, ) = account.call{value: ethOutAmount}("");
    require(success, "TestFulfillSwap: fulfillEthOutSwap send ether to msg.sender failed");
  }

  receive() external payable {}
}
