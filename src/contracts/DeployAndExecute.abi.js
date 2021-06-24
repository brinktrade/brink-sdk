module.exports = [
    {
      "inputs": [
        {
          "internalType": "contract ISingletonFactory",
          "name": "_singletonFactory",
          "type": "address"
        },
        {
          "internalType": "contract ExecutorAccessController",
          "name": "_executorAccessController",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "initCode",
          "type": "bytes"
        },
        {
          "internalType": "bytes32",
          "name": "salt",
          "type": "bytes32"
        },
        {
          "internalType": "bytes",
          "name": "execData",
          "type": "bytes"
        }
      ],
      "name": "deployAndExecute",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]