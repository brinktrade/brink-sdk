module.exports = [
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "chainId_",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "delegateCall",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "value",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "externalCall",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "implementation",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "unsignedData",
        "type": "bytes"
      }
    ],
    "name": "metaDelegateCall",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "signature",
        "type": "bytes"
      },
      {
        "internalType": "bytes",
        "name": "unsignedData",
        "type": "bytes"
      }
    ],
    "name": "metaDelegateCall_EIP1271",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proxyOwner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "ptr",
        "type": "bytes32"
      }
    ],
    "name": "storageLoad",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "data",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
  