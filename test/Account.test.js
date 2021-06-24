const { ethers } = require('hardhat')
const { expect } = require('chai')

describe('Account with PrivateKeySigner', function () {
    beforeEach(async function () {
        console.log("Doing this")
        const SingletonFactory = await ethers.getContractFactory('SingletonFactory')
        const singletonFactory = await SingletonFactory.deploy()
        const addresses = await ethers.getSigners()
        const owner = addresses[0]
    })

    it.only('Deploys the proxy contract', function () {
        console.log("GOT HERE")
    })
})