// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity >=0.7.6;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@brinkninja/core/contracts/Proxy/ProxyGettable.sol";
import "@brinkninja/core/contracts/Called/CallExecutable.sol";

/// @title Verifier for ERC20 limit swaps
/// @notice These functions should be executed by metaPartialSignedDelegateCall() on Brink account proxy contracts
contract LimitSwapVerifierMock is ProxyGettable {

    event TokenToToken (uint256 bitmapIndex, uint256 bit, IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount, 
    uint256 expiryBlock, address to, bytes data);

    event EthToToken (uint256 bitmapIndex, uint256 bit, IERC20 token, uint256 ethAmount, uint256 tokenAmount, uint256 expiryBlock,
    address to, bytes data);

    event TokenToEth (uint256 bitmapIndex, uint256 bit, IERC20 token, uint256 tokenAmount, uint256 ethAmount, uint256 expiryBlock,
    address to, bytes data);

  /// @dev Executes an ERC20 to ERC20 limit swap
  /// @notice This should be executed by metaPartialSignedDelegateCall() with the following signed and unsigned params
  /// @param bitmapIndex The index of the replay bit's bytes32 slot [signed]
  /// @param bit The value of the replay bit [signed]
  /// @param tokenIn The input token provided for the swap [signed]
  /// @param tokenOut The output token required to be received from the swap [signed]
  /// @param tokenInAmount Amount of tokenIn provided [signed]
  /// @param tokenOutAmount Amount of tokenOut required to be received [signed]
  /// @param expiryBlock The block when the swap expires [signed]
  /// @param to Address of the contract that will fulfill the swap [unsigned]
  /// @param data Data to execute on the `to` contract to fulfill the swap [unsigned]
  function tokenToToken(
    uint256 bitmapIndex, uint256 bit, IERC20 tokenIn, IERC20 tokenOut, uint256 tokenInAmount, uint256 tokenOutAmount, uint256 expiryBlock, address to, bytes memory data
  )
    external
  {
    emit TokenToToken(bitmapIndex, bit, tokenIn, tokenOut, tokenInAmount, tokenOutAmount, expiryBlock, to, data);
  }

  /// @dev Executes an ETH to ERC20 limit swap
  /// @notice This should be executed by metaPartialSignedDelegateCall() with the following signed and unsigned params
  /// @param bitmapIndex The index of the replay bit's bytes32 slot [signed]
  /// @param bit The value of the replay bit [signed]
  /// @param token The output token required to be received from the swap [signed]
  /// @param ethAmount Amount of ETH provided [signed]
  /// @param tokenAmount Amount of token required to be received [signed]
  /// @param expiryBlock The block when the swap expires [signed]
  /// @param to Address of the contract that will fulfill the swap [unsigned]
  /// @param data Data to execute on the `to` contract to fulfill the swap [unsigned]
  function ethToToken(
    uint256 bitmapIndex, uint256 bit, IERC20 token, uint256 ethAmount, uint256 tokenAmount, uint256 expiryBlock,
    address to, bytes memory data
  )
    external
  {
    emit EthToToken(bitmapIndex, bit, token, ethAmount, tokenAmount, expiryBlock, to, data);
  }

  /// @dev Executes an ERC20 to ETH limit swap
  /// @notice This should be executed by metaPartialSignedDelegateCall() with the following signed and unsigned params
  /// @param bitmapIndex The index of the replay bit's bytes32 slot [signed]
  /// @param bit The value of the replay bit [signed]
  /// @param token The input token provided for the swap [signed]
  /// @param tokenAmount Amount of tokenIn provided [signed]
  /// @param expiryBlock The block when the swap expires [signed]
  /// @param to Address of the contract that will fulfill the swap [unsigned]
  /// @param data Data to execute on the `to` contract to fulfill the swap [unsigned]
  function tokenToEth(
    uint256 bitmapIndex, uint256 bit, IERC20 token, uint256 tokenAmount, uint256 ethAmount, uint256 expiryBlock,
    address to, bytes memory data
  )
    external
  {
    emit TokenToEth(bitmapIndex, bit, token, tokenAmount, ethAmount, expiryBlock, to, data);
  }
}
