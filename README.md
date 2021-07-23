# Brink SDK

This module can be used to interact with Brink proxy accounts, either as the account owner/signer or as an executor of messages signed by the account owner/signer.

## Installation

```
npm install @brinkninja/sdk
```

## Setup

```
const brinkSDK = require('@brinkninja/sdk')

// Instantiate with environment config: `local`, `dev`, `prod` (see [brink-environment](https://github.com/brinktrade/brink-environment) and an instance of [ethers.js](https://github.com/ethers-io/ethers.js/)
const brink = brinkSDK({
  environment: 'dev',
  ethers
})

// Get an Account instance for any account owner, to read account state and execute meta transactions for this account
const account = brink.account(ownerAddress)

// Get an AccountSigner instance to sign messages as the owner of an account. Takes an ethers.js [Signer](https://docs.ethers.io/v5/api/signer/#Signer)
const accountSigner = brink.accountSigner(ethers)
```

## Account

### Read-only Methods

These methods are available to read from account contract state

#### implementation()

Returns the implementation address of the account proxy contract. Should be a deployed instance of [Account.sol](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Account/Account.sol)

```
const implAddress = await account.implementation()
```

#### isDeployed()

Returns true if the account has been deployed

```
const deployed = await account.isDeployed()
```

### Transaction Methods

These methods issue transactions to an account contract. They wrap [ethers.js Contract Meta-class methods](https://docs.ethers.io/v5/api/contract/contract/#Contract-functionsCall) and can be used in the same way.

The Account instance exposes the [ethers.js write method analysis properties](https://docs.ethers.io/v5/api/contract/contract/#Contract--check) `estimateGas`, `populateTransaction`, and `callStatic`. These can be used for any Account transaction. For example, getting transaction data without submitting the transaction can be done like this:

```
const txData = await account.populateTransaction.sendLimitSwap(swapSignedMsg, toAddress, callData)
```

All of these transactions (except for `deploy()`) will include the desired action after account deployment, if the account has not been deployed yet, using [DeployAndExecute.sol](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Batched/DeployAndExecute.sol). If the account is already deployed, the action will be executed directly on the account contract.

#### sendLimitSwap(limitSwapSignedMessage, to, data)

This method can be used by executors to execute limit swaps for an account. Requires a valid signed message from the account owner. Uses [LimitSwapVerifier.sol](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol) for state verification.

Params:

`limitSwapSignedMessage`: a valid signed limit swap message (see AccountSigner methods `signEthToTokenSwap()`, `signTokenToTokenSwap()`, and `signTokenToEthSwap()`)
`to`: Address of the contract that will provide liquidity for the fullfilment of the swap
`data`: Call data that will be executed on the contract at `toAddress` in order to fullfil the swap

Example:

```
const tx = await account.sendLimitSwap(swapSignedMsg, toAddress, callData)
```

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

#### metaDelegateCall(to, data, signature)

Calls [metaDelegateCall](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Account/Account.sol#L65) on the account contract.

This can only be called with a valid message signed by the owner of the account

Example:

```
const tx = await account.metaDelegateCall(to, data, signature)
```

#### metaPartialSignedDelegateCall(to, data, signature, unsignedData)

Calls [metaPartialSignedDelegateCall](https://github.com/brinktrade/brink-core/blob/2b2fda4bd5b3f91e31e8d736a60155755c2376f6/contracts/Account/Account.sol#L87) on the account contract.

This can only be called with a valid message signed by the owner of the account

Example:

```
const tx = await account.metaPartialSignedDelegateCall(to, data, signature, unsignedData)
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

### accountAddress()

Returns the address of the account

### signerAddress()

Returns the address of the signer

### signCancel(bitmapIndex, bit)

Returns a signed `metaDelegatedCall` message that allows execution of a cancel.

Verifier function: [CancelVerifier.cancel()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/CancelVerifier.sol)

### signEthTransfer(bitmapIndex, bit, recipient, amount, expiryBlock)

Returns a signed `metaDelegatedCall` message that allows execution of an ETH transfer

Verifier function: [TransferVerifier.ethTransfer()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/TransferVerifier.sol#L18)

### signTokenTransfer(bitmapIndex, bit, tokenAddress, recipient, amount, expiryBlock)

Returns a signed `metaDelegatedCall` message that allows execution of an ERC20 token transfer

Verifier function: [TransferVerifier.tokenTransfer()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/TransferVerifier.sol#L36)

### signEthToTokenSwap(bitmapIndex, bit, tokenAddress, ethAmount, tokenAmount, expiryBlock)

Returns a signed `metaPartialSignedDelegateCall` message that allows execution of an ETH to ERC20 token swap

Verifier function: [LimitSwapVerifier.ethToToken()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol#L54)

### signTokenToEthSwap(bitmapIndex, bit, tokenAddress, tokenAmount, ethAmount, expiryBlock)

Returns a signed `metaPartialSignedDelegateCall` message that allows execution of an ERC20 token to ETH swap

Verifier function: [LimitSwapVerifier.tokenToEth()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol#L82)

### signTokenToTokenSwap(bitmapIndex, bit, tokenInAddress, tokenOutAddress, tokenInAmount, tokenOutAmount, expiryBlock)

Returns a signed `metaPartialSignedDelegateCall` message that allows execution of an ERC20 token to ERC20 token swap

Verifier function: [LimitSwapVerifier.tokenToToken()](https://github.com/brinktrade/brink-verifiers/blob/4e2b607e7eefb3dc00dbc725bacedaeb28f647ed/contracts/Verifiers/LimitSwapVerifier.sol#L27)
