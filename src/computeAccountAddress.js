const ProxyBytecode = require('./contracts/Proxy.bytecode')
const computeCreate2Address = require('./computeCreate2Address')

const computeAccountAddress = (deployerAddress, implementationAddress, ownerAddress, accountDeploymentSalt) => {
  return computeCreate2Address({
    bytecode: ProxyBytecode,
    deployerAddress,
    salt: accountDeploymentSalt,
    paramTypes: ['address', 'address'],
    params: [implementationAddress, ownerAddress]
  })
}

module.exports = computeAccountAddress
