const _ = require('lodash')
const { signEIP712, constants } = require('@brinkninja/utils')
const { MAX_UINT256 } = constants
const {
  LIMIT_SWAP_VERIFIER,
  TRANSFER_VERIFIER,
  CANCEL_VERIFIER
} = require('@brinkninja/verifiers/constants')
const sigToValidECDSA = require('./utils/sigToValidECDSA')
const proxyAccountFromOwner = require('./proxyAccountFromOwner')
const encodeFunctionCall = require('./encodeFunctionCall')
const {
  verifyTokenToTokenSwap,
  verifyEthToTokenSwap,
  verifyTokenToEthSwap
} = require('./callVerifiers')
const {
  metaDelegateCallSignedParamTypes
} = require('./constants')

class AccountSigner {

  constructor ({ signer, chainId }) {
    this._signer = signer
    this._chainId = chainId
    this._accountVersion = '1'
  }

  async accountAddress () {
    const addr = proxyAccountFromOwner(await this.signerAddress())
    return addr
  }

  async signerAddress () {
    const addr = await this._signer.getAddress()
    return addr
  }

  async signCancel(bitmapIndex, bit) {
    const call = {
      functionName: 'cancel',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'}
      ],
      params: [bitmapIndex, bit]
    }

    const signedCall = await this.signMetaDelegateCall(CANCEL_VERIFIER, call)
    return signedCall
  }

  async signEthTransfer(bitmapIndex, bit, recipient, amount, expiryBlock=MAX_UINT256) {
    const call = {
      functionName: 'ethTransfer',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'recipient', type: 'address'},
        { name: 'amount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'}
      ],
      params: [bitmapIndex, bit, recipient, amount, expiryBlock]
    }

    const signedCall = await this.signMetaDelegateCall(TRANSFER_VERIFIER, call)
    return signedCall
  }

  async signTokenTransfer(bitmapIndex, bit, tokenAddress, recipient, amount, expiryBlock=MAX_UINT256) {
    const call = {
      functionName: 'tokenTransfer',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'recipient', type: 'address'},
        { name: 'amount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'}
      ],
      params: [bitmapIndex, bit, tokenAddress, recipient, amount, expiryBlock]
    }

    const signedCall = await this.signMetaDelegateCall(TRANSFER_VERIFIER, call)
    return signedCall
  }

  async signEthToTokenSwap(bitmapIndex, bit, tokenAddress, ethAmount, tokenAmount, expiryBlock = MAX_UINT256) {
    verifyEthToTokenSwap(tokenAddress, ethAmount, tokenAmount, expiryBlock)
    const call = {
      functionName: 'ethToToken',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'ethAmount', type: 'uint256'},
        { name: 'tokenAmount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'},
        { name: 'to', type: 'address'},
        { name: 'data', type: 'bytes'}
      ],
      params: [
        bnToStr(bitmapIndex), bnToStr(bit), tokenAddress, bnToStr(ethAmount), bnToStr(tokenAmount),
        bnToStr(expiryBlock)
      ]
    }

    const signedCall = await this.signMetaDelegateCall(LIMIT_SWAP_VERIFIER, call)
    return signedCall
  }

  async signTokenToEthSwap(bitmapIndex, bit, tokenAddress, tokenAmount, ethAmount, expiryBlock = MAX_UINT256) {
    verifyTokenToEthSwap(tokenAddress, tokenAddress, ethAmount, expiryBlock)
    const call = {
      functionName: 'tokenToEth',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'token', type: 'address'},
        { name: 'tokenAmount', type: 'uint256'},
        { name: 'ethAmount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'},
        { name: 'to', type: 'address'},
        { name: 'data', type: 'bytes'}
      ],
      params: [
        bnToStr(bitmapIndex), bnToStr(bit), tokenAddress, bnToStr(tokenAmount), bnToStr(ethAmount),
        bnToStr(expiryBlock)
      ]
    }

    const signedCall = await this.signMetaDelegateCall(LIMIT_SWAP_VERIFIER, call)
    return signedCall
  }

  async signTokenToTokenSwap(bitmapIndex, bit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock = MAX_UINT256) {
    verifyTokenToTokenSwap(tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock)
    const call = {
      functionName: 'tokenToToken',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'},
        { name: 'tokenIn', type: 'address'},
        { name: 'tokenOut', type: 'address'},
        { name: 'tokenInAmount', type: 'uint256'},
        { name: 'tokenOutAmount', type: 'uint256'},
        { name: 'expiryBlock', type: 'uint256'},
        { name: 'to', type: 'address'},
        { name: 'data', type: 'bytes'}
      ],
      params: [
        bnToStr(bitmapIndex), bnToStr(bit), tokenInAddress, tokenOutAddress, bnToStr(tokenInAmount),
        bnToStr(tokenOutAmount), bnToStr(expiryBlock)
      ]
    }

    const signedCall = await this.signMetaDelegateCall(LIMIT_SWAP_VERIFIER, call)
    return signedCall
  }

  async signMetaDelegateCall (toAddress, call) {
    const signedFnCall = await this.signFunctionCall(
      'metaDelegateCall',
      metaDelegateCallSignedParamTypes,
      [ toAddress, call ]
    )
    return signedFnCall
  }

  async signFunctionCall (functionName, paramTypes, params) {
    let encodedParams = []
    for (let i in params) {
      const typeData = paramTypes[i]
      if (typeData.calldata) {
        const callEncoded = encodeFunctionCall(params[i])
        encodedParams[i] = callEncoded
      } else {
        encodedParams[i] = params[i].toString()
      }
    }

    const { typedData, typedDataHash, signature: sigFromSigner } = await signEIP712({
      signer: this._signer,
      contractAddress: await this.accountAddress(),
      contractName: 'BrinkAccount',
      contractVersion: this._accountVersion,
      chainId: this._chainId,
      method: functionName,
      paramTypes,
      params: encodedParams
    })

    const signerAddress = await this._signer.getAddress()
    const { signature } = sigToValidECDSA(sigFromSigner)

    return {
      message: typedDataHash,
      EIP712TypedData: typedData,
      signature,
      signer: signerAddress,
      accountAddress: await this.accountAddress(),
      functionName,
      signedParams: parseParams(paramTypes, params)
    }
  }
}

function parseParams (paramTypes, params) {
  let paramsArray = []
  for (let i in paramTypes) {
    const { name, type, calldata } = paramTypes[i]
    paramsArray[i] = {
      name,
      type
    }
    if (calldata) {
      paramsArray[i].value = encodeFunctionCall(params[i])
      paramsArray[i].callData = {
        functionName: params[i].functionName,
        params: parseParams(params[i].paramTypes, params[i].params)
      }
    } else {
      paramsArray[i].value = params[i]
    }
  }
  return paramsArray
}

function bnToStr (bnOrString) {
  return bnOrString.toString()
}

module.exports = AccountSigner
