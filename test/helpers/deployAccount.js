const computeAccountBytecode = require('../../src/computeAccountBytecode')
const computeAccountAddress = require('../../src/computeAccountAddress')
const web3Utils = require('web3-utils')

const saltHex = web3Utils.utf8ToHex('<<account|deployment|salt>>')
const chainId = 1

const deployAccount = async (deployer, implAddress, ownerAddress, salt, chainId) => {
  const bytecode = computeAccountBytecode(implAddress, ownerAddress, chainId)
  const accountAddress = computeAccountAddress(
    deployer.address,
    implAddress,
    ownerAddress,
    chainId,
    saltHex
  )
  await deployer.deploy(bytecode, salt)
  return accountAddress
}

module.exports = deployAccount
