const ethJsUtil = require('ethereumjs-util')

const recoverSigner = ({ signature, typedDataHash }) => {
  const { v, r, s } = ethJsUtil.fromRpcSig(signature)
  const recoveredSigner = ethJsUtil.toChecksumAddress(
    ethJsUtil.bufferToHex(
      ethJsUtil.pubToAddress(
        ethJsUtil.ecrecover(
          ethJsUtil.toBuffer(typedDataHash), v, r, s
        )
      )
    )
  )
  return recoveredSigner
}

module.exports = recoverSigner
