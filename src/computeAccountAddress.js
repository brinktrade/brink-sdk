const ProxyBytecode = require('./contracts/Proxy.bytecode')
const computeCreate2Address = require('./computeCreate2Address')

const computeAccountAddress = (deployerAddress, implementationAddress, ownerAddress, chainId, accountDeploymentSalt) => {
  return computeCreate2Address({
    bytecode: ProxyBytecode,
    deployerAddress,
    salt: accountDeploymentSalt,
    paramTypes: ['address', 'address', 'uint256'],
    params: [implementationAddress, ownerAddress, chainId]
  })
}

module.exports = computeAccountAddress
