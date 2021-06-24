const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')
const { ethers } = require('ethers')

const _abiMap = {
  Account: require('./contracts/Account.abi'),
  SingletonFactory: require('./contracts/SingletonFactory.abi'),
  DeployAndExecute: require('./contracts/DeployAndExecute.abi'),
  ERC20: require('./contracts/ERC20.abi')
}

class Account {
  constructor ({
    accountVersion,
    accountDeploymentSalt,
    chainId,
    ethersProvider,
    ethersSigner,
    deployerAddress,
    create2CallerAddress,
    deployAndExecuteAddress
  }) {
    this._accountVersion = accountVersion
    this._accountDeploymentSalt = accountDeploymentSalt
    this._chainId = chainId
    this._ethersProvider = ethersProvider
    this._ethersSigner = ethersSigner
    this._deployerAddress = deployerAddress
    this._create2CallerAddress = create2CallerAddress || deployerAddress
    this._deployAndExecuteAddress = deployAndExecuteAddress
  }

  async deploy () {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deploy(): Account contract already deployed`)
    }

    const bytecode = this._getAccountBytecode()
    const deployer = this._getDeployer()
    // const data = deployer.functions.deploy(bytecode, this._accountDeploymentSalt).encodeABI()
    // const data = deployer.functions.deploy(bytecode, this._accountDeploymentSalt).encodeABI()
    // const data = deployer.interface.functions.encode.deploy(bytecode, this._accountDeploymentSalt)
    // console.log(deployer.interface.functions)
    const ABI = [
      "function deploy(bytes _initCode, bytes32 _salt)"
    ];
    const iface = new ethers.utils.Interface(ABI);
    const data = iface.encodeFunctionData("deploy", [ bytecode, this._accountDeploymentSalt ])
    const promiEvent = this._ethersSigner.sendTransaction({
      to: deployer.address,
      data
    })
    return promiEvent
  }

  async isDeployed () {
    if (!this.address) { throw new Error('Error: Account.isDeployed(): Account not loaded') }
    console.log(this.address)
    const code = await this._ethersProvider.provider.getCode(this.address)
    console.log(code)
    return code !== '0x'
  }

  async loadFromParams(implementationAddress, ownerAddress) {
    this._initImplementationAddress = implementationAddress
    this._initOwnerAddress = ownerAddress
    this.owner = this._initOwnerAddress.toLowerCase()

    this.address = computeAccountAddress(
      this._create2CallerAddress,
      implementationAddress,
      ownerAddress,
      this._chainId,
      this._accountDeploymentSalt
    )

    this._accountLogicImpl = this._ethersContract('Account', implementationAddress)
  }

  _getDeployer () {
    if (!this._deployer) {
      if (!this._deployerAddress) {
        throw new Error('Account: deployerAddress not found')
      }
      this._deployer = this._ethersContract('SingletonFactory', this._deployerAddress)
    }
    return this._deployer
  }

  _getAccountBytecode () {
    if (!this._initImplementationAddress || !this._initOwnerAddress) {
      throw new Error(
        `Error: Account._getAccountBytecode(): no implementation address or owner address. Use loadFromParams()`
      )
    }

    const bytecode = computeAccountBytecode(
      this._initImplementationAddress, this._initOwnerAddress, this._chainId
    )

    return bytecode
  }

  _ethersContract(contractName, contractAddress) {
    return new this._ethersProvider.Contract(contractAddress, _abiMap[contractName])
  }
}

module.exports = Account