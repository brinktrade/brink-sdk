const computeInitBytecode = require('./computeInitBytecode')
const ProxyBytecode = require('./contracts/Proxy.bytecode')

const computeAccountBytecode = (implementationAddress, ownerAddress, chainId) => {
  return computeInitBytecode({
    bytecode: ProxyBytecode,
    paramTypes: ['address', 'address', 'uint256'],
    params: [implementationAddress, ownerAddress, chainId]
  })
}

module.exports = computeAccountBytecode
