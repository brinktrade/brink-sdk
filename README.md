# Brink SDK

This module can be used to interact with Brink proxy accounts, either as the account owner/signer or as an executor of messages signed by the account owner/signer.

## Installation

```
npm install @brinkninja/sdk
```

## Account

### Setup

```
const brink = require('@brinkninja/sdk')

/**
 * ownerAddress: address of the account owner
 * provider: an ethers.js provider
 * signer: an ethers.js signer. Transactions to the account will be signed by this signer. Does not have to be the account owner
 * verifiers: array of custom verifier definitions
 **
const account = brink.account(ownerAddress, { provider, signer, verifiers })
```

### Read-only Methods

These methods are available to read from account contract state

#### isDeployed()

Returns true if the account has been deployed

```
const deployed = await account.isDeployed()
```

#### bitUsed(bitmapIndex, bit)

Returns true if the given `bitmapIndex` and `bit` have been used for a previou limit swap or cancel transaction

### Transaction Methods

These methods issue transactions to an account contract. They wrap [ethers.js Contract Meta-class methods](https://docs.ethers.io/v5/api/contract/contract/#Contract-functionsCall) and can be used in the same way.

The Account instance exposes the [ethers.js write method analysis properties](https://docs.ethers.io/v5/api/contract/contract/#Contract--check) `estimateGas`, `populateTransaction`, and `callStatic`. These can be used for any Account transaction. For example, getting transaction data without submitting the transaction can be done like this:

```
const txData = await account.populateTransaction.ApprovalSwapsV1.tokenToToken(swapSignedMsg, recipientAddress, toAddress, callData)
```

All of these transactions (except for `deploy()`) will include the desired action after account deployment, if the account has not been deployed yet, using [DeployAndExecute.sol](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Batched/DeployAndExecute.sol). If the account is already deployed, the action will be executed directly on the account contract.

#### deploy()

Deploys the account contract. Throws an error if the contract is already deployed

Example:

```
const tx = await account.deploy()
```

#### externalCall(value, to, data)

Calls [externalCall](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Account/Account.sol#L36) on the account contract.

This can only be called if the ethers.js signer is the owner of the account

Example:

```
const tx = await account.externalCall(value, to, data)
```

#### delegateCall(to, data)

Calls [delegateCall](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Account/Account.sol#L50) on the account contract.

This can only be called if the ethers.js signer is the owner of the account

Example:

```
const tx = await account.delegateCall(to, data)
```

#### metaDelegateCall(signedMessage, unsignedDataArray)

Calls [metaDelegateCall](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Account/Account.sol#L65) on the account contract.

This can only be called with a valid message signed by the owner of the account

Example:

```
const tx = await account.metaDelegateCall(signedMessage, [unsignedTo, unsignedData])
```

#### Verifier metaDelegateCall methods

All contract methods in https://github.com/brinktrade/brink-verifiers/tree/177ee40291d92f3b0da371ea1939e11964b0de18/contracts/Verifiers contracts can be executed through `metaDelegateCall` using the SDK.

For example, a `ApprovalSwapsV1.tokenToToken()` verifier signed message can be executed by calling `account.ApprovalSwapsV1.tokenToToken()`:

```
  await account.ApprovalSwapsV1.tokenToToken(ethToTokenSignedMessage, unsignedRecipient, unsignedTo, unsignedData)
```

Each verifier function takes a signed message object from AccountSigner as the first param, followed by any unsigned params required by the verifier function.

Supported functions are:

```
  account.CancelVerifier.cancel()
  account.TransferVerifier.tokenTransfer()
  account.TransferVerifier.ethTransfer()
  account.NftTransferVerifier.nftTransfer()
  account.ApprovalSwapsV1.tokenToToken()
  account.ApprovalSwapsV1.tokenToNft()
  account.ApprovalSwapsV1.nftToToken()
  account.ApprovalSwapsV1.tokenToERC1155()
  account.ApprovalSwapsV1.ERC1155ToToken()
  account.ApprovalSwapsV1.ERC1155ToERC1155()
```

## AccountSigner

Handles signing of account messages. These authorize actions that can be taken on the account by executors.

Messages are returned in this format:

```
{
  message: '<signed message hash>',
  EIP712TypedData: <object with decoded EIP712 typed data>,
  signature: '<the signature>',
  signer: '<address of the signer>',
  accountAddress: '<address of the account>',
  functionName: '<function on Account.sol that is authorized by this message>',
  signedParams: <array of signed parameters>
}
```

### Setup

```
const brink = require('@brinkninja/sdk')

/**
 * signer: an ethers.js signer. Signed messages returned are valid only for the Brink account owned by this signer
 * network: name of a supported Brink network (default `mainnet`). Signed messages returned are valid only for this network
 * verifiers: array of custom verifier definitions
 **
const accountSigner = brink.accountSigner(signer, { network, verifiers })
```

### accountAddress()

Returns the address of the account

### signerAddress()

Returns the address of the signer

### verifier signing functions

Supported functions are:

```
  accountSigner.CancelVerifier.signCancel()
  accountSigner.TransferVerifier.signTokenTransfer()
  accountSigner.TransferVerifier.signEthTransfer()
  accountSigner.NftTransferVerifier.signNftTransfer()
  accountSigner.ApprovalSwapsV1.signTokenToToken()
  accountSigner.ApprovalSwapsV1.signTokenToNft()
  accountSigner.ApprovalSwapsV1.signNftToToken()
  accountSigner.ApprovalSwapsV1.signTokenToERC1155()
  accountSigner.ApprovalSwapsV1.signERC1155ToToken()
  accountSigner.ApprovalSwapsV1.signERC1155ToERC1155()
```

## Supported Verifier Contracts

| Contract | Address | Networks |
| --- | --- | --- |
| ApprovalSwapsV1.sol | 0x9A7B09e63FD17a36e5Ab187a5D7B75149fEBFa53 |[mainnet](https://etherscan.io/address/0x9A7B09e63FD17a36e5Ab187a5D7B75149fEBFa53#code), [goerli](https://goerli.etherscan.io/address/0x9A7B09e63FD17a36e5Ab187a5D7B75149fEBFa53#code)|
| CancelVerifier.sol | 0xE0670a90E67eda0126D54843267b27Ca6343B2d8 |[mainnet](https://etherscan.io/address/0xE0670a90E67eda0126D54843267b27Ca6343B2d8#code), [goerli](https://goerli.etherscan.io/address/0xE0670a90E67eda0126D54843267b27Ca6343B2d8#code)|
| TransferVerifier.sol | 0x6df5AE08Ec7aE5CC2E9e3b0850A61AD7C73bC9A9 |[mainnet](https://etherscan.io/address/0x6df5AE08Ec7aE5CC2E9e3b0850A61AD7C73bC9A9#code), [goerli](https://goerli.etherscan.io/address/0x6df5AE08Ec7aE5CC2E9e3b0850A61AD7C73bC9A9#code)|
| NftTransferVerifier.sol | 0x946CBd55EA50619C599d69Ab230Dff8707987D00 |[mainnet](https://etherscan.io/address/0x946CBd55EA50619C599d69Ab230Dff8707987D00#code), [goerli](https://goerli.etherscan.io/address/0x946CBd55EA50619C599d69Ab230Dff8707987D00#code)|

### Verifier Repos

https://github.com/brinktrade/brink-verifiers
https://github.com/brinktrade/brink-verifiers-v2

### Custom Verifier Setup

*** WARNING: SIGING MESSAGES WITH UNSECURE VERIFIER CONTRACTS COULD PUT YOUR FUNDS AT RISK ***

To use custom verifiers, can provide account and accountSigner with an array of verifier definitions:

```
  const signerWithCustomVerifiers = brink.accountSigner(ethersSigner, {
    network: 'hardhat',
    verifiers: [{
    "functionName": "myFunction",
    "functionSignature": "myFunction(uint256,uint256)",
    "functionSignatureHash": "0x3c447f23",
    "contractName": "MyVerifier",
    "contractAddress": "0xE100eF1C4339Dd4E4b54d5cBB6CcEfA96071E227",
    "paramTypes": [
      {
        "name": "paramOne",
        "type": "uint256",
        "signed": true
      },
      {
        "name": "paramTwo",
        "type": "uint256",
        "signed": false
      }
    ]
  }]
```
