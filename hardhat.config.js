require('@nomiclabs/hardhat-ethers')

module.exports = {
  networks: {
    hardhat: {
      accounts: {
        accountsBalance: '1000000000000000000000000000' // 1 billion ETH
      },
      allowUnlimitedContractSize: true
    }
  },
  solidity: {
    version: '0.8.10',
    settings: {
      optimizer: {
        enabled: true,
        runs: 800
      },
      metadata: {
        // do not include the metadata hash, since this is machine dependent
        // and we want all generated code to be deterministic
        // https://docs.soliditylang.org/en/v0.7.6/metadata.html
        bytecodeHash: 'none'
      },
    },
  },
  mocha: {
    timeout: 10000,
    file: './test/setupTeardown.js'
  },
  paths: {
    sources: "./test/contracts",
    cache: "./test/cache",
    artifacts: "./test/artifacts"
  }
}
