const { ethers } = require('hardhat')

async function randomSigner () {
  const [defaultSigner] = await ethers.getSigners()
  const signer = (await ethers.Wallet.createRandom()).connect(ethers.provider)

  // fund the randomly created wallet signer with some eth
  await defaultSigner.sendTransaction({
    to: signer.address,
    value: ethers.BigNumber.from('100000000000000000000')
  })

  return signer
}

module.exports = randomSigner
