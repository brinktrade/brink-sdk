const chainIdMap = {
  mainnet: 1,
  goerli: 5,
  rinkeby: 4,
  ropsten: 3,
  kovan: 42,
  hardhat: 31337
}

function getChainId (network) {
  const chainId = chainIdMap[network]
  if (!chainId) throw new Error(`Chain ID not found for network ${network}`)
  return chainId
}

module.exports = getChainId
