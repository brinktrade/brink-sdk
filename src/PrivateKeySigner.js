const EthAccount = require('eth-lib/lib/account')
const ethJsUtil = require('ethereumjs-util')

class PrivateKeySigner {

  constructor (privateKey) {
    this.privateKey = privateKey
    this.address = ethJsUtil.bufferToHex(ethJsUtil.privateToAddress(privateKey))
  }

  async sign ({ typedDataHash }) {
    return EthAccount.sign(typedDataHash, this.privateKey)
  }
}

module.exports = PrivateKeySigner
