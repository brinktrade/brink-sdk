const { toBN: BN } = require('web3-utils')
const zeroAddressCheck = require('./utils/zeroAddressCheck')
const typedDataEIP712 = require('./typedDataEIP712')
const computeAccountAddress = require('./computeAccountAddress')
const encodeFunctionCall = require('./encodeFunctionCall')
const {
  verifyBitData,
  verifyTransferEth,
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
  executePartialSignedDelegateCallParamTypes,
  tokenToTokenSwapParamTypes,
  ethToTokenSwapParamTypes,
  tokenToEthSwapParamTypes,
  cancelParamTypes,
  recoveryCancelParamTypes
} = require('./constants')

class AccountSigner {

  constructor ({ accountVersion, chainId, signer }) {
    this.accountVersion = accountVersion
    this.chainId = chainId
    this.signer = signer
  }

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

  async signTransferEth(bitData, recipientAddress, amount) {
    const call = {
      functionName: null,
      paramTypes: [],
      params: []
    }
    const callEncoded = encodeFunctionCall(call)

    verifyTransferEth(amount, recipientAddress, callEncoded)

    const signedCall = await this.signExecuteCall(bitData, amount, recipientAddress, callEncoded)
    
    return {
      ...signedCall,
      call,
      callEncoded
    }
  }

  async signTransferToken (bitData, tokenAddress, recipientAddress, amount) {
    verifyTransferToken(tokenAddress, recipientAddress, amount)

    const call = {
      functionName: 'transfer',
      paramTypes: [
        { name: 'recipient', type: 'address' },
        { name: 'amount', type: 'uint256'}
      ],
      params: [recipientAddress, amount.toString()]
    }
    const callEncoded = encodeFunctionCall(call)

    const signedCall = await this.signExecuteCall(bitData, BN(0), tokenAddress, callEncoded)

    return {
      ...signedCall,
      call,
      callEncoded
    }
  }
  
  async signTokenToTokenSwap (
    bitData, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock
  ) {
    verifyTokenToTokenSwap(tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock)
    const signedFnCall = await this.signFunctionCall(
      'tokenToTokenSwap',
      bitData,
      tokenToTokenSwapParamTypes,
      [ tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock ]
    )
    return signedFnCall
  }
  
  async signEthToTokenSwap (bitData, tokenAddress, ethAmount, tokenAmount, expiryBlock) {
    verifyEthToTokenSwap(tokenAddress, ethAmount, tokenAmount, expiryBlock)
    const signedFnCall = await this.signFunctionCall(
      'ethToTokenSwap',
      bitData,
      ethToTokenSwapParamTypes,
      [ tokenAddress, ethAmount, tokenAmount, expiryBlock ]
    )
    return signedFnCall
  }
  
  async signTokenToEthSwap (bitData, tokenAddress, tokenAmount, ethAmount, expiryBlock) {
    verifyTokenToEthSwap(tokenAddress, tokenAmount, ethAmount, expiryBlock)
    const signedFnCall = await this.signFunctionCall(
      'tokenToEthSwap',
      bitData,
      tokenToEthSwapParamTypes,
      [ tokenAddress, tokenAmount, ethAmount, expiryBlock ]
    )
    return signedFnCall
  }

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
  
  async signUpgrade(bitData, proxyAdminDelegatedAddress, implementationAddress) {
    const call = {
      functionName: 'upgradeTo',
      paramTypes: [{ name: 'impl', type: 'address' }],
      params: [implementationAddress]
    }
    const callEncoded = encodeFunctionCall(call)

    verifyUpgrade(implementationAddress)

    const signedCall = await this.signExecuteDelegateCall(bitData, proxyAdminDelegatedAddress, callEncoded)

    return {
      ...signedCall,
      call,
      callEncoded
    }
  }

  async signAddProxyOwner(bitData, proxyAdminDelegatedAddress, newOwnerAddress) {
    const call = {
      functionName: 'addProxyOwner',
      paramTypes: [{ name: 'owner', type: 'address' }],
      params: [newOwnerAddress]
    }
    const callEncoded = encodeFunctionCall(call)

    verifyAddProxyOwner(newOwnerAddress)

    const signedCall = await this.signExecuteDelegateCall(bitData, proxyAdminDelegatedAddress, callEncoded)

    return {
      ...signedCall,
      call,
      callEncoded
    }
  }

  async signRemoveProxyOwner(bitData, proxyAdminDelegatedAddress, ownerAddress) {
    const call = {
      functionName: 'removeProxyOwner',
      paramTypes: [{ name: 'owner', type: 'address' }],
      params: [ownerAddress]
    }
    const callEncoded = encodeFunctionCall(call)

    verifyAddProxyOwner(ownerAddress)

    const signedCall = await this.signExecuteDelegateCall(bitData, proxyAdminDelegatedAddress, callEncoded)

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
  
  async signExecuteDelegateCall (bitData, toAddress, callData) {
    const signedFnCall = await this.signFunctionCall(
      'executeDelegateCall',
      bitData,
      executeDelegateCallParamTypes,
      [ toAddress, callData ]
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

  async signCancel (bitData) {
    const signedFnCall = await this.signFunctionCall(
      'cancel',
      bitData,
      cancelParamTypes,
      []
    )
    return signedFnCall
  }

  async signFunctionCall (functionName, bitData, paramTypes, params) {
    if (!this.accountAddress) { throw new Error('AccountSigner not initialized') }

    const { bitmapIndex, bit } = verifyBitData(bitData)

    let params_noBN = params.map(p => p.toString())

    const { typedData, typedDataHash } = typedDataEIP712({
      accountVersion: this.accountVersion,
      chainId: this.chainId,
      accountAddress: this.accountAddress,
      functionName,
      bitmapIndex,
      bit,
      paramTypes,
      params: params_noBN
    })
    const signature = await this.signMessage({ typedData, typedDataHash })

    return {
      message: typedDataHash,
      signature,
      signer: this.signer.address,
      accountAddress: this.accountAddress,
      functionName,
      bitmapIndex: bitmapIndex.toString(),
      bit: bit.toString(),
      paramTypes,
      params: params_noBN
    }
  }

  async signMessage ({ typedData, typedDataHash }) {
    const signature = await this.signer.sign({ typedData, typedDataHash })
    return signature
  }
}

module.exports = AccountSigner
