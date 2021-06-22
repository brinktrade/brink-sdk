const swapFromSignedFunctionCall = require('./swapFromSignedFunctionCall')
const {
  swapTypes,
  tokenToTokenSwapParamTypes,
  ethToTokenSwapParamTypes,
  tokenToEthSwapParamTypes,
} = require('./constants')

const accountFnMap = {
  ethToTokenSwap: swapTypes.ETH_TO_TOKEN,
  tokenToEthSwap: swapTypes.TOKEN_TO_ETH,
  tokenToTokenSwap: swapTypes.TOKEN_TO_TOKEN,
}

// constructs Swap with function call params
const swapFromMessageData = ({ web3, messageData, defaults }) => {
  const {
    accountAddress,
    bitData,
    messageHash,
    signature,
    signerAddress
  } = messageData

  const { accountFunction } = messageData

  const type = accountFnMap[accountFunction]
  if (!type) {
    throw new Error(`swapFromMessageData() Error: invalid accountFunction ${accountFunction}`)
  }

  const { functionName, paramTypes, params } = (() => {
    switch(type) {
      case swapTypes.TOKEN_TO_TOKEN: return {
        functionName: 'tokenToTokenSwap',
        paramTypes: tokenToTokenSwapParamTypes,
        params: [
          messageData.tokenInAddress,
          messageData.tokenOutAddress,
          messageData.tokenInAmount.toString(),
          messageData.tokenOutAmount.toString(),
          messageData.expiryBlock.toString()
        ]
      }
      case swapTypes.ETH_TO_TOKEN: return {
        functionName: 'ethToTokenSwap',
        paramTypes: ethToTokenSwapParamTypes,
        params: [
          messageData.tokenAddress,
          messageData.ethAmount.toString(),
          messageData.tokenAmount.toString(),
          messageData.expiryBlock.toString()
        ]
      }
      case swapTypes.TOKEN_TO_ETH: return {
        functionName: 'tokenToEthSwap',
        paramTypes: tokenToEthSwapParamTypes,
        params: [
          messageData.tokenAddress,
          messageData.tokenAmount.toString(),
          messageData.ethAmount.toString(),
          messageData.expiryBlock.toString()
        ]
      }
    }
  })()

  const signedFunctionCall = {
    message: messageHash,
    signature,
    signer: signerAddress,
    accountAddress,
    functionName,
    bitmapIndex: bitData.bitmapIndex,
    bit: bitData.bit,
    paramTypes,
    params
  }

  return swapFromSignedFunctionCall({ web3, signedFunctionCall, defaults })
}

module.exports = swapFromMessageData
