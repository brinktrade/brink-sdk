const { toBN: BN } = require('web3-utils')
const zeroAddressCheck = require('./utils/zeroAddressCheck')
const typedDataEIP712 = require('./typedDataEIP712')
const computeAccountAddress = require('./computeAccountAddress')
const encodeFunctionCall = require('./encodeFunctionCall')
const {
  verifyBitData,
  verifyEncodeTransferEth,
  verifyTransferToken,
  verifyTokenToTokenSwap,
  verifyEthToTokenSwap,
  verifyTokenToEthSwap,
  verifyUpgrade,
  verifyAddProxyOwner
} = require('./callVerifiers')
const {
  executeCallParamTypes,
  executeCallWithoutValueParamTypes,
  executeCallWIthoutDataParamTypes,
  executeDelegateCallParamTypes,
  metaDelegateCallSignedParamTypes,
  metaPartialSignedDelegateCallSignedParamTypes,
  tokenToTokenSwapParamTypes,
  ethToTokenSwapParamTypes,
  tokenToEthSwapParamTypes,
  cancelParamTypes,
  recoveryCancelParamTypes
} = require('./constants')

const MAX_UINT_256 = '115792089237316195423570985008687907853269984665640564039457584007913129639935'

class AccountSigner {

  constructor ({ accountVersion, chainId, signer }) {
    this.accountVersion = accountVersion
    this.chainId = chainId
    this.signer = signer
  }


  // TODO: consolidate into just initFromParams in constructor

  initFromAddress(address) {
    zeroAddressCheck('address', address)
    this.accountAddress = address
  }

  initFromParams(deployerAddress, implementationAddress, chainId, accountDeploymentSalt) {
    zeroAddressCheck('deployerAddress', deployerAddress)
    zeroAddressCheck('implementationAddress', implementationAddress)
    this.accountAddress = computeAccountAddress(
      deployerAddress,
      implementationAddress,
      this.signer.address,
      chainId,
      accountDeploymentSalt
    )
  }

  async signUpgrade(proxyAdminVerifierAddress, implementationAddress) {
    const call = {
      functionName: 'upgradeTo',
      paramTypes: [{ name: 'impl', type: 'address' }],
      params: [implementationAddress]
    }
    verifyUpgrade(implementationAddress)

    const signedCall = await this.signMetaDelegateCall(proxyAdminVerifierAddress, call)
    return signedCall
  }

  async signSetProxyOwner(proxyAdminVerifierAddress, ownerAddress) {
    const call = {
      functionName: 'setProxyOwner',
      paramTypes: [{ name: 'owner', type: 'address' }],
      params: [ownerAddress]
    }

    const signedCall = await this.signMetaDelegateCall(proxyAdminVerifierAddress, call)
    return signedCall
  }

  async signCancel(cancelVerifierAddress, bitMapIndex, bit) {
    const call = {
      functionName: 'cancel',
      paramTypes: [
        { name: 'bitmapIndex', type: 'uint256' },
        { name: 'bit', type: 'uint256'}
      ],
      params: [bitMapIndex, bit]
    }

    const signedCall = await this.signMetaDelegateCall(cancelVerifierAddress, call)
    return signedCall
  }

  async signEthToTokenSwap(limitSwapVerifierAddress, bitmapIndex, bit, tokenAddress, ethAmount, tokenAmount, toAddress, data, expiryBlock=MAX_UINT_256) {
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
      params: [bitmapIndex, bit, tokenAddress, ethAmount, tokenAmount, expiryBlock, toAddress, data]
    }

    const signedCall = await this.signMetaPartialSignedDelegateCall(limitSwapVerifierAddress, call)
    return signedCall
  }

  async signTokenToEthSwap(limitSwapVerifierAddress, bitmapIndex, bit, tokenAddress, tokenAmount, ethAmount, toAddress, data, expiryBlock=MAX_UINT_256) {
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
      params: [bitmapIndex, bit, tokenAddress, tokenAmount, ethAmount, expiryBlock, toAddress, data]
    }

    const signedCall = await this.signMetaPartialSignedDelegateCall(limitSwapVerifierAddress, call)
    return signedCall
  }

  async signTokenToTokenSwap(limitSwapVerifierAddress, bitmapIndex, bit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, toAddress, data, expiryBlock=MAX_UINT_256) {
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
      params: [bitmapIndex, bit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock, toAddress, data]
    }

    const signedCall = await this.signMetaPartialSignedDelegateCall(limitSwapVerifierAddress, call)
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

  async signMetaPartialSignedDelegateCall (toAddress, call) {
    const signedFnCall = await this.signFunctionCall(
      'metaPartialSignedDelegateCall',
      metaPartialSignedDelegateCallSignedParamTypes,
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

    const { typedData, typedDataHash } = typedDataEIP712({
      accountVersion: this.accountVersion,
      chainId: this.chainId,
      accountAddress: this.accountAddress,
      functionName,
      paramTypes,
      params: encodedParams
    })
    const signature = await this._signMessage({ typedData, typedDataHash })

    return {
      message: typedDataHash,
      signature,
      signer: this.signer.address,
      accountAddress: this.accountAddress,
      functionName,
      signedParams: parseParams(paramTypes, params)
    }
  }

  async _signMessage ({ typedData, typedDataHash }) {
    const signature = await this.signer.sign({ typedData, typedDataHash })
    return signature
  }


  //
  // FIX THESE UP

  async signCreateRangeOrder(
    bitData, uniswapV3RangeOrdersDelegatedAddress,
    rangeOrderPositionManagerAddress, positionHash, tokenInAddress, tokenInAmount,
    liquidityOutAmount, expiryBlock
  ) {
    const call = {
      functionName: 'createRangeOrder',
      paramTypes: [
        { name:  'rangeOrderPositionManager', type: 'address' },
        { name:  'positionHash', type: 'bytes32' },
        { name:  'tokenIn', type: 'address' },
        { name:  'tokenInAmount', type: 'uint256' },
        { name:  'liquidityOutAmount', type: 'uint128' },
        { name:  'expiryBlock', type: 'uint256' }
      ],
      params: [
        rangeOrderPositionManagerAddress, positionHash, tokenInAddress, tokenInAmount,
        liquidityOutAmount, expiryBlock
      ]
    }
    const callEncoded = encodeFunctionCall(call)

    const signedCall = await this.signExecutePartialSignedDelegateCall(bitData, uniswapV3RangeOrdersDelegatedAddress, callEncoded)

    return {
      ...signedCall,
      call,
      callEncoded
    }
  }

  async signCreateRangeOrderETH(
    bitData, uniswapV3RangeOrdersDelegatedAddress,
    rangeOrderPositionManagerAddress, positionHash, ethInAmount, liquidityOutAmount, expiryBlock
  ) {
    const call = {
      functionName: 'createRangeOrderETH',
      paramTypes: [
        { name:  'rangeOrderPositionManager', type: 'address' },
        { name:  'positionHash', type: 'bytes32' },
        { name:  'ethInAmount', type: 'uint256' },
        { name:  'liquidityOutAmount', type: 'uint128' },
        { name:  'expiryBlock', type: 'uint256' }
      ],
      params: [
        rangeOrderPositionManagerAddress, positionHash, ethInAmount, liquidityOutAmount, expiryBlock
      ]
    }
    const callEncoded = encodeFunctionCall(call)

    const signedCall = await this.signExecutePartialSignedDelegateCall(bitData, uniswapV3RangeOrdersDelegatedAddress, callEncoded)

    return {
      ...signedCall,
      call,
      callEncoded
    }
  }

  async signExecuteCall (bitData, ethValue, toAddress, callData) {
    const signedFnCall = await this.signFunctionCall(
      'executeCall',
      bitData,
      executeCallParamTypes,
      [ ethValue, toAddress, callData ]
    )
    return signedFnCall
  }

  async signExecutePartialSignedDelegateCall (bitData, toAddress, callData) {
    const signedFnCall = await this.signFunctionCall(
      'executePartialSignedDelegateCall',
      bitData,
      executePartialSignedDelegateCallParamTypes,
      [ toAddress, callData ]
    )
    return signedFnCall
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

module.exports = AccountSigner
