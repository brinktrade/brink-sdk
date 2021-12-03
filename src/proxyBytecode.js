const { ACCOUNT } = require('@brinkninja/core/constants')

function proxyBytecode (proxyOwnerAddress) {
  return '3d604180600a3d3981f3363d3d373d3d3d363d73'
    + ACCOUNT.slice(2).toLowerCase()
    + '5af43d82803e903d91602b57fd5bf3'
    + proxyOwnerAddress.slice(2).toLowerCase()
}

module.exports = proxyBytecode
