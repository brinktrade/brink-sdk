// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity =0.8.10;
pragma abicoder v1;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721 is ERC721 {
  constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) { }

  function mint(address to, uint256 tokenId) external {
    _mint(to, tokenId);
  }

  function transferAny(address from, address to, uint tokenId) external {
    _transfer(from, to, tokenId);
  }
}
