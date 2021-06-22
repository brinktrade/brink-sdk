const { toBN: BN } = require('web3-utils')
const { transferTypes, tokenTypes } = require('./constants')

class Transfer {
  
  constructor ({ web3, signedFunctionCall }) {
    if (!web3) throw new Error(`web3 required`)
    if (!signedFunctionCall) throw new Error(`signedFunctionCall required`)
    if (signedFunctionCall.functionName !== 'executeCall') {
      throw new Error(
        `Invalid signedFunctionCall: expected functionName "${signedFunctionCall.functionName}" to be "executeCall"`
      )
    }
    if (!signedFunctionCall.call) throw new Error(`Invalid signedFunctionCall: no call defined`)
    if (!signedFunctionCall.accountAddress) throw new Error(`Invalid signedFunctionCall: no accountAddress`)
    if (!signedFunctionCall.params) throw new Error(`Invalid signedFunctionCall: no params`)

    const { functionName: callFnName } = signedFunctionCall.call
    if (callFnName !== null && callFnName !== 'transfer') {
      throw new Error(`Invalid signedFunctionCall: expected call.functionName "${callFnName}" to be "transfer" or null`)
    }

    this._web3 = web3
    this._signedFunctionCall = signedFunctionCall
    this._type = callFnName == null ? transferTypes.ETH : transferTypes.TOKEN
    this._accountAddress = signedFunctionCall.accountAddress
  }

  recipient () {
    const { params, call } = this._signedFunctionCall
    return (this._type == transferTypes.ETH ? params[1] : call.params[0]).toLowerCase()
  }

  amount () {
    const { params, call } = this._signedFunctionCall
    return BN(this._type == transferTypes.ETH ? params[0] : call.params[1])
  }

  token () {
    const { params } = this._signedFunctionCall
    return this._type == transferTypes.ETH ? tokenTypes.ETH : params[1].toLowerCase()
  }

  type () {
    return this._type
  }

  accountAddress () {
    return this._accountAddress
  }

  signedMessage () {
    return {
      message: this._signedFunctionCall.message,
      signature: this._signedFunctionCall.signature,
      signer: this._signedFunctionCall.signer,
      v: this._signedFunctionCall.v,
      r: this._signedFunctionCall.r,
      s: this._signedFunctionCall.s
    }
  }

  salt () {
    return this._signedFunctionCall.salt
  }
}

module.exports = Transfer