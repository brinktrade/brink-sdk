const { toBN: BN } = require('web3-utils')
const {
  swapFunctionNames,
  swapTypes,
  tokenTypes,
  adapterTokenToTokenParamTypes,
  adapterEthToTokenParamTypes,
  adapterTokenToEthParamTypes
} = require('./constants')
const encodeFunctionCall = require('./encodeFunctionCall')

const _abiMap = {
  ERC20: require('./contracts/ERC20.abi')
}

const _swapTypeMap = {
  [`${swapFunctionNames.tokenToTokenSwap}`]: swapTypes.TOKEN_TO_TOKEN,
  [`${swapFunctionNames.ethToTokenSwap}`]: swapTypes.ETH_TO_TOKEN,
  [`${swapFunctionNames.tokenToEthSwap}`]: swapTypes.TOKEN_TO_ETH,
}

class Swap {
  
  constructor ({ web3, signedFunctionCall, defaults }) {
    if (!signedFunctionCall ||
      !signedFunctionCall.functionName ||
      !_swapTypeMap[signedFunctionCall.functionName]
    ) {
      throw new Error(`Invalid signedFunctionCall`)
    }

    this._web3 = web3
    this._signedFunctionCall = signedFunctionCall
    this._contractDefaults = defaults
    this._params = this._signedFunctionCall.params

    this._type = _swapTypeMap[signedFunctionCall.functionName]
  }

  async isExpired () {
    const expiryBlockMined = !this.expiryBlock().gt(await this._latestBlock())
    return expiryBlockMined
  }

  async accountHasRequiredBalance () {
    const { value } = this.requiredValue()
    const accountBalance = await this.accountTokenInBalance()
    return accountBalance.gte(value)
  }

  async accountTokenInBalance () {
    let balance
    const accountAddress = this.accountAddress()
    const tokenInAddress = this.tokenInAddress()
    if (tokenInAddress === tokenTypes.ETH) {
      balance = BN(await this._web3.eth.getBalance(accountAddress))
    } else {
      const tokenIn = this._web3Contract('ERC20', tokenInAddress)
      balance = BN(await tokenIn.methods.balanceOf(accountAddress).call())
    }
    return balance
  }

  requiredValue () {
    return {
      tokenAddress: this.tokenInAddress(),
      value: this.tokenInAmount()
    }
  }

  type () {
    return this._type
  }

  signedFunctionCall () {
    return this._signedFunctionCall
  }

  tokenInAddress () {
    switch (this._type) {
      case swapTypes.TOKEN_TO_TOKEN: return this._params[0]
      case swapTypes.ETH_TO_TOKEN: return tokenTypes.ETH
      case swapTypes.TOKEN_TO_ETH: return this._params[0]
    }
  }

  tokenOutAddress () {
    switch (this._type) {
      case swapTypes.TOKEN_TO_TOKEN: return this._params[1]
      case swapTypes.ETH_TO_TOKEN: return this._params[0]
      case swapTypes.TOKEN_TO_ETH: return tokenTypes.ETH
    }
  }

  tokenInAmount () {
    switch (this._type) {
      case swapTypes.TOKEN_TO_TOKEN: return BN(this._params[2])
      case swapTypes.ETH_TO_TOKEN: return BN(this._params[1])
      case swapTypes.TOKEN_TO_ETH: return BN(this._params[1])
    }
  }

  tokenOutAmount () {
    switch (this._type) {
      case swapTypes.TOKEN_TO_TOKEN: return BN(this._params[3])
      case swapTypes.ETH_TO_TOKEN: return BN(this._params[2])
      case swapTypes.TOKEN_TO_ETH: return BN(this._params[2])
    }
  }

  expiryBlock () {
    switch (this._type) {
      case swapTypes.TOKEN_TO_TOKEN: return BN(this._params[4])
      case swapTypes.ETH_TO_TOKEN: return BN(this._params[3])
      case swapTypes.TOKEN_TO_ETH: return BN(this._params[3])
    }
  }

  accountAddress () {
    return this._signedFunctionCall.accountAddress
  }

  signedMessage () {
    return {
      message: this._signedFunctionCall.message,
      signature: this._signedFunctionCall.signature,
      signer: this._signedFunctionCall.signer
    }
  }

  bitData () {
    return {
      bitmapIndex: this._signedFunctionCall.bitmapIndex,
      bit: this._signedFunctionCall.bit
    }
  }

  async canExecute () {
    if (await this.isExpired()) {
      return {
        error: 'Swap cannot be executed, expiryBlock exceeded',
        canExecute: false
      }
    }

    if (!(await this.accountHasRequiredBalance())) {
      return {
        error: 'Swap cannot be executed, account has insufficient balance',
        canExecute: false
      }
    }

    return {
      error: null,
      canExecute: true
    }
  }

  getAdapterCallData () {
    switch (this._type) {
      case swapTypes.TOKEN_TO_TOKEN: return encodeFunctionCall({
        functionName: 'tokenToToken',
        paramTypes: adapterTokenToTokenParamTypes,
        params: [
          this.tokenInAddress(),
          this.tokenOutAddress(),
          this.tokenInAmount(),
          this.tokenOutAmount(),
          this.accountAddress()
        ]
      })
      case swapTypes.ETH_TO_TOKEN: return encodeFunctionCall({
        functionName: 'ethToToken',
        paramTypes: adapterEthToTokenParamTypes,
        params: [
          this.tokenOutAddress(),
          this.tokenOutAmount(),
          this.accountAddress()
        ]
      })
      case swapTypes.TOKEN_TO_ETH: return encodeFunctionCall({
        functionName: 'tokenToEth',
        paramTypes: adapterTokenToEthParamTypes,
        params: [
          this.tokenInAddress(),
          this.tokenInAmount(),
          this.tokenOutAmount(),
          this.accountAddress()
        ]
      })
    }
  }

  _web3Contract (contractName, address) {
    return new this._web3.eth.Contract(
      _abiMap[contractName],
      address,
      this._contractDefaults
    )
  }

  async _latestBlock () {
    const block = await this._web3.eth.getBlock('latest')
    return new BN(block.number)
  }
}

module.exports = Swap
