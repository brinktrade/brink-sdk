const { soliditySha3, toChecksumAddress } = require('web3-utils')
const { encodedParams } = require('@brinkninja/utils')

export type SaltedDeployerAddressArgs = {
  deployerAddress: string,
  salt: string,
  bytecode: string,
  paramTypes: string[],
  paramValues: string[]
}

function saltedDeployerAddress ({
  deployerAddress,
  salt,
  bytecode,
  paramTypes,
  paramValues
}: SaltedDeployerAddressArgs) {
  const initParams = encodedParams(paramTypes, paramValues)
  const initCode = `${bytecode}${initParams}`
  const codeHash = soliditySha3({ t: 'bytes', v: initCode })
  const addressAsBytes32 = soliditySha3(
    { t: 'uint8', v: 255 }, // 0xff
    { t: 'address', v: deployerAddress },
    { t: 'bytes32', v: salt },
    { t: 'bytes32', v: codeHash }
  )
  const address = toChecksumAddress(`0x${addressAsBytes32.slice(26,66)}`)
  return { address, initParams, initCode, codeHash, addressAsBytes32 }
}

export default saltedDeployerAddress
