const computeAccountBytecode = require('./computeAccountBytecode')
const computeAccountAddress = require('./computeAccountAddress')

const _abiMap = {
  Account: require('./contracts/Account.abi'),
  IDeployer: require('./contracts/IDeployer.abi'),
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
    deployAndExecuteAddress
  }) {
    this._accountVersion = accountVersion
    this._accountDeploymentSalt = accountDeploymentSalt
    this._chainId = chainId
    this._ethersProvider = ethersProvider
    this._ethersSigner = ethersSigner
    this._deployerAddress = deployerAddress
    this._deployAndExecuteAddress = deployAndExecuteAddress
  }

  async deploy () {
    if (await this.isDeployed()) {
      throw new Error(`Error: Account.deploy(): Account contract already deployed`)
    }
    const bytecode = this._getAccountBytecode()
    const deployer = this._getDeployer()
    const promiEvent = deployer.deploy(bytecode, this._accountDeploymentSalt)
    return promiEvent
  }

  async isDeployed () {
    if (!this.address) { throw new Error('Error: Account.isDeployed(): Account not loaded') }
    const code = await this._ethersProvider.provider.getCode(this.address)
    return code !== '0x'
  }

  async loadFromParams(implementationAddress, ownerAddress) {
    this._initImplementationAddress = implementationAddress
    this._initOwnerAddress = ownerAddress
    this.owner = this._initOwnerAddress.toLowerCase()

    this.address = computeAccountAddress(
      this._deployerAddress,
      implementationAddress,
      ownerAddress,
      this._chainId,
      this._accountDeploymentSalt
    )

    this._accountImpl = this._ethersContract('Account', implementationAddress)
  }

  async loadFromAddress(address) {
    this.address = address

    if (!await this.isDeployed()) {
      throw new Error(`Error: Account.loadFromAddress(): No code at contract address ${address}`)
    }

    const account = await this.account()
    const implAddress = await account.implementation()
    this._accountImpl = this._ethersContract('Account', implAddress)
  }

  async account () {
    if (!this._account && this.address && await this.isDeployed()) {
      this._account = this._ethersContract('Account', this.address)
    }
    return this._account
  }

  _getDeployer () {
    if (!this._deployer) {
      if (!this._deployerAddress) {
        throw new Error('Account: deployerAddress not found')
      }
      this._deployer = this._ethersContract('IDeployer', this._deployerAddress)
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
    return new this._ethersProvider.Contract(
      contractAddress, _abiMap[contractName], this._ethersSigner
    )
  }
}

module.exports = Account