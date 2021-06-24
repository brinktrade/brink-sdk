async function loadAndDeployAccount (account, accountLogicAddress, ownerAddress) {
  return new Promise(async (resolve, reject) => {
    const promiEvent = await account.loadAndDeploy(accountLogicAddress, ownerAddress)    
    promiEvent.onReceipt(async (receipt) => {
      await delay(500)
      resolve(receipt)
    })
    promiEvent.onError(reject)
  })
}

const delay = t => new Promise(resolve => setTimeout(resolve, t))

module.exports = loadAndDeployAccount
