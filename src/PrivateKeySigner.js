const EthAccount = require('eth-lib/lib/account')
const ethJsUtil = require('ethereumjs-util')

class PrivateKeySigner {

  constructor (privateKey) {
    this.privateKey = privateKey
    this._address = ethJsUtil.bufferToHex(ethJsUtil.privateToAddress(privateKey))
  }

  async sign ({ typedDataHash }) {
    return EthAccount.sign(typedDataHash, this.privateKey)
  }

  // needs to be async
  async address () {
    return this._address
  }
}

module.exports = PrivateKeySigner
