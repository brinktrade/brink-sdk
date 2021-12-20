const { ACCOUNT } = require('@brinkninja/core/constants')

function proxyBytecode (proxyOwnerAddress) {
  return '603c3d8160093d39f33d3d3d3d363d3d37363d6f'
    + removeLeadingZeros(ACCOUNT.slice(2)).toLowerCase()
    + '5af43d3d93803e602657fd5bf3'
    + proxyOwnerAddress.slice(2).toLowerCase()
}

const removeLeadingZeros = s => s.replace(/^0+/, '')

module.exports = proxyBytecode
