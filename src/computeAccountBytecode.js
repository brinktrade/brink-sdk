const computeInitBytecode = require('./computeInitBytecode')
const ProxyBytecode = require('./contracts/Proxy.bytecode')

const computeAccountBytecode = (implementationAddress, ownerAddress) => {
  return computeInitBytecode({
    bytecode: ProxyBytecode,
    paramTypes: ['address', 'address'],
    params: [implementationAddress, ownerAddress]
  })
}

module.exports = computeAccountBytecode
