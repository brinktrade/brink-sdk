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
 * signer: an ethers.js signer. Transactions to the account will be signed by this signer. Does not have to be the
 * account owner
 **
const account = brink.account(ownerAddress, { provider, signer })
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
const txData = await account.populateTransaction.sendLimitSwap(swapSignedMsg, toAddress, callData)
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

For example, a `LimitSwapVerifier.ethToToken()` verifier signed message can be executed by calling `account.LimitSwapVerifier.ethToToken()`:

```
  await account.LimitSwapVerifier.ethToToken(ethToTokenSignedMessage, unsignedTo, unsignedData)
```

Each verifier function takes a signed message object from AccountSigner as the first param, followed by any unsigned params required by the verifier function.

Supported functions are:

```
  account.TransferVerifier.tokenTransfer()
  account.TransferVerifier.ethTransfer()
  account.LimitSwapVerifier.ethToToken()
  account.LimitSwapVerifier.tokenToEth()
  account.LimitSwapVerifier.tokenToToken()
  account.NftLimitSwapVerifier.tokenToNft()
  account.NftLimitSwapVerifier.nftToToken()
  account.NftLimitSwapVerifier.nftToNft()
  account.NftApprovalSwapVerifier.tokenToNft()
  account.NftApprovalSwapVerifier.nftToToken()
  account.CancelVerifier.cancel()
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
 * network: name of a supported Brink network (i.e. `goerli`, `mainnet`). Signed messages returned are valid only for
 * this network
 **
const accountSigner = brink.accountSigner(signer, network)
```

### accountAddress()

Returns the address of the account

### signerAddress()

Returns the address of the signer

### CancelVerifier.signCancel(bitmapIndex, bit)

Returns a signed `metaDelegatedCall` message that allows execution of a cancel.

Verifier function: [CancelVerifier.cancel()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/CancelVerifier.sol)

### TransferVerifier.signEthTransfer(bitmapIndex, bit, recipient, amount, expiryBlock)

Returns a signed `metaDelegatedCall` message that allows execution of an ETH transfer

Verifier function: [TransferVerifier.ethTransfer()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/TransferVerifier.sol#L18)

### TransferVerifier.signTokenTransfer(bitmapIndex, bit, tokenAddress, recipient, amount, expiryBlock)

Returns a signed `metaDelegatedCall` message that allows execution of an ERC20 token transfer

Verifier function: [TransferVerifier.tokenTransfer()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/TransferVerifier.sol#L36)

### LimitSwapVerifier.signEthToToken(bitmapIndex, bit, tokenAddress, ethAmount, tokenAmount, expiryBlock)

Returns a signed `metaDelegateCall` message that allows execution of an ETH to ERC20 token swap

Verifier function: [LimitSwapVerifier.ethToToken()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol#L54)

### LimitSwapVerifier.signTokenToEth(bitmapIndex, bit, tokenAddress, tokenAmount, ethAmount, expiryBlock)

Returns a signed `metaDelegateCall` message that allows execution of an ERC20 token to ETH swap

Verifier function: [LimitSwapVerifier.tokenToEth()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol#L82)

### LimitSwapVerifier.signTokenToToken(bitmapIndex, bit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock)

Returns a signed `metaDelegateCall` message that allows execution of an ERC20 token to ERC20 token swap

Verifier function: [LimitSwapVerifier.tokenToToken()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol#L27)

### NftLimitSwapVerifier.signTokenToNft(bitmapIndex, bit, tokenIn, nftOut, tokenInAmount, expiryBlock)

Returns a signed `metaDelegateCall` message that allows execution of an ERC20 or ETH token to ERC721 swap

Verifier function: [NftLimitSwapVerifier.nftToToken()](https://github.com/brinktrade/brink-verifiers/blob/177ee40291d92f3b0da371ea1939e11964b0de18/contracts/Verifiers/NftLimitSwapVerifier.sol#L28)

### NftApprovalSwapVerifier.signTokenToNft(bitmapIndex, bit, tokenIn, nftOut, tokenInAmount, expiryBlock)

Returns a signed `metaDelegateCall` message that allows execution of an ERC20 or ETH token to ERC721 swap with signer approval

Verifier function: [NftApprovalSwapVerifier.nftToToken()](https://github.com/brinktrade/brink-verifiers/blob/02eafcc56a180cad126e1f1c3f0fdd979cf05bc6/contracts/Verifiers/NftApprovalSwapVerifier.sol#L29)
