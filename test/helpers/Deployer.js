const { soliditySha3 } = require('web3-utils')
const { ethers } = require('hardhat')
const { contractDeploymentSalt: salt } = require('@brinkninja/environment/config/network.config.local1.json')

const abiCoder = ethers.utils.defaultAbiCoder

class Deployer {
  
  constructor (_singletonFactory) {
    this.singletonFactory = _singletonFactory
  }

  async deployAndLog (contractName, paramTypes, paramValues) {
    const paramsStr = `(${paramValues.map(v => v.toString()).join(', ')})`
    console.log(`Deploying ${contractName}${paramsStr}...`)
    const contractInstance = await this.deploy(contractName, paramTypes, paramValues)
    console.log(`Deployed ${contractName} at ${contractInstance.address}`)
    console.log()
    return contractInstance
  }

  async deploy (contractName, paramTypes, paramValues) {
    const contract = await ethers.getContractFactory(contractName)
    const contractInstance = await this._deployContract(contract, paramTypes, paramValues)
    return contractInstance
  }

  async _deployContract (contract, paramTypes, paramValues) {
    const computedAddr = this._computeDeployedAddress(contract, paramTypes, paramValues)
    const initParams = abiCoder.encode(paramTypes, paramValues).slice(2)
    const initCode = `${contract.bytecode}${initParams}`
    await this.singletonFactory.deploy(initCode, salt)
    const contractInstance = await contract.attach(computedAddr)
    return contractInstance
  }
  
  _computeDeployedAddress (contract, paramTypes, paramValues) {
    const initParams = abiCoder.encode(paramTypes, paramValues).slice(2)
    const initCode = `${contract.bytecode}${initParams}`
    const codeHash = soliditySha3({ t: 'bytes', v: initCode })
    const addressAsBytes32 = soliditySha3(
      { t: 'uint8', v: 255 }, // 0xff
      { t: 'address', v: this.singletonFactory.address },
      { t: 'bytes32', v: salt },
      { t: 'bytes32', v: codeHash }
    )
    const address = `0x${addressAsBytes32.slice(26,66)}`
    return address
  }

}



module.exports = Deployer
