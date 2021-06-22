const { TypedDataUtils } = require('eth-sig-util')

const typedDataEIP712 = ({
  accountVersion,
  chainId,
  accountAddress,
  functionName,
  bitmapIndex,
  bit,
  paramTypes,
  params
}) => {
  if (paramTypes.length !== params.length) {
    throw new Error('typedDataEIP712: different number of paramTypes and params')
  }

  const typedData = getTypedData({
    accountVersion,
    chainId,
    accountAddress,
    functionName,
    bitmapIndex,
    bit,
    paramTypes,
    params
  })

  // TypedDataUtils.sign is a poorly named function from
  // eth-sig-utils (metamask's signer utility). It generates the hashed message
  // from the given typed data, it doesn't actually do any signing
  const typedDataHash = `0x${TypedDataUtils.sign(typedData).toString('hex')}`
  return { typedData, typedDataHash }
}

// get typed data object for EIP712 signature
function getTypedData({
  accountVersion,
  chainId,
  accountAddress,
  functionName,
  bitmapIndex,
  bit,
  paramTypes,
  params
}) {
  const functionType = capitalize(functionName)
  let typedData = {
    types: {
      EIP712Domain: [
        { name: "name", type: "string" },
        { name: "version", type: "string" },
        { name: "chainId", type: "uint256" },
        { name: "verifyingContract", type: "address" }
      ],
      [`${functionType}`]: [
        { name: "bitmapIndex", type: "uint256" },
        { name: "bit", type: "uint256" },
        ...paramTypes
      ]
    },
    primaryType: functionType,
    domain: {
      name: "BrinkAccount",
      version: accountVersion,
      chainId: chainId,
      verifyingContract: accountAddress
    },
    message: {
      bitmapIndex: bitmapIndex.toString(),
      bit: bit.toString()
    }
  }
  for (var i in paramTypes) {
    const { name } = paramTypes[i]
    if (!name) {
      throw new Error(`typedDataEIP712.getTypedData() Error: expected "name" property in paramType`)
    }
    const paramValue = params[i]
    typedData.message[name] = paramValue.toString()
  }
  return typedData
}

const capitalize = (s) => {
  if (typeof s !== 'string') return ''
  return s.charAt(0).toUpperCase() + s.slice(1)
}

module.exports = typedDataEIP712
