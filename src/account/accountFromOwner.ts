const { ACCOUNT_FACTORY } = require('@brinkninja/core/constants')
const saltedDeployAddress = require('../saltedDeployAddress')
const proxyBytecode = require('../proxyBytecode')

function accountFromOwner (owner: string): string {
  const { address: account } = saltedDeployAddress(
    ACCOUNT_FACTORY, '0x', proxyBytecode(owner), [], []
  )
  return account
}

export default accountFromOwner
