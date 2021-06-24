class Account {
    constructor ({
      accountVersion,
      accountDeploymentSalt,
      chainId,
      ethers,
      ethersSigner,
      deployerAddress,
      create2CallerAddress,
      deployAndExecuteAddress
    }) {
      this._accountVersion = accountVersion
      this._accountDeploymentSalt = accountDeploymentSalt
      this._chainId = chainId
      this._ethers = ethers
      this._ethersSigner = ethersSigner
      this._deployerAddress = deployerAddress
      this._create2CallerAddress = create2CallerAddress || deployerAddress
      this._deployAndExecuteAddress = deployAndExecuteAddress
    }
}