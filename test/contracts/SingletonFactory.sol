// SPDX-License-Identifier: MIT

pragma solidity >=0.7.5;
pragma abicoder v2;

/**
 * @dev modified SingletonFactory for local deployments
 */
contract SingletonFactory {
  event Deployed (address payable createdContract, bytes initCode, bytes32 salt);

  function deploy(bytes memory initCode, bytes32 salt)
    external
    returns (address payable createdContract)
  {
    assembly {
      createdContract := create2(0, add(initCode, 0x20), mload(initCode), salt)
    }
    require(createdContract != address(0), "SingletonFactory: deploy failed");
    emit Deployed(createdContract, initCode, salt);
  }
}
