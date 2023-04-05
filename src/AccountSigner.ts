import { SignedStrategyData, StrategyData } from './strategies/StrategyTypes'

const _ = require('lodash')
const { signEIP712 } = require('@brinkninja/utils')
const sigToValidECDSA = require('./utils/sigToValidECDSA')
const capitalize = require('./utils/capitalize')
const verifyParamInput = require('./utils/verifyParamInput')
const isBigNumber = require('./utils/isBigNumber')
const addSegmentedObj = require('./utils/addSegmentedObj')
const proxyAccountFromOwner = require('./proxyAccountFromOwner')
const encodeFunctionCall = require('./encodeFunctionCall')
const {
  metaDelegateCallSignedParamTypes, tokenTypes
} = require('./constants')

const { VERIFIERS } = require('@brinkninja/config').mainnet

// TODO: move to config
const StrategyTargetAddress = '0x0a8A4c2aF510Afe2A40D230696cAcA6967f75BbF'

class AccountSigner {

  _signer: any
  _chainId: BigInt
  _accountVersion: string

  constructor (signer: any, chainId: BigInt, verifiers = []) {
    this._signer = signer
    this._chainId = chainId
    this._accountVersion = '1'

    const verifierDefs = [...VERIFIERS, ...verifiers]
    verifierDefs.forEach(({ contractName, functionName, contractAddress, paramTypes }) => {
      // create a signer function for each Verifier
      const fnName = `sign${capitalize(functionName)}`

      const segments = [contractName, fnName]

      const $this: AccountSigner = this

      addSegmentedObj($this, segments, (async function () {
        let paramValuesMap: any
        if (_.isObject(arguments[0]) && !isBigNumber(arguments[0])) {
          paramValuesMap = arguments[0]
        } else {
          paramValuesMap = {}
          _.forEach(arguments, (paramVal: any, i: number) => {
            paramValuesMap[paramTypes[i].name] = paramVal
          })
        }

        try {
          verifyParamInput(paramValuesMap, paramTypes)
        } catch (err: any) {
          throw new Error(`${fnName}: ${err.stack}`)
        }

        // change contract token types to `address`
        const parsedParamTypes = _.map(paramTypes, (t: any) => ({...t, type: tokenTypes.includes(t.type) ? 'address' : t.type }))
        
        // get array of param values
        const paramsArray = _.filter(parsedParamTypes, { signed: true }).map((paramType: any) => {
          // convert BN's to strings
          const pVal = paramValuesMap[paramType.name]
          return isBigNumber(pVal) ? pVal.toString() : pVal
        })
        const params: Map<number, any> = new Map<number, any>()
        paramsArray.forEach((paramVal: any, i: number) => {
          params.set(i, paramVal)
        })
        const call = { functionName, paramTypes: parsedParamTypes, params }

        // sign the call to the verifier
        const signedCall = await $this.signMetaDelegateCall(contractAddress, call)
        return signedCall
      }).bind($this))

    })
  }

  async accountAddress () {
    const addr = proxyAccountFromOwner(await this.signerAddress())
    return addr
  }

  async signerAddress () {
    const addr = await this._signer.getAddress()
    return addr
  }

  async signStrategyEIP712 (strategyData: StrategyData): Promise<SignedStrategyData> {
    const accountAddress = await this.accountAddress()
    const { typedDataHash, signature } = await signEIP712({
      signer: this._signer,
      contractAddress: accountAddress,
      contractName: 'BrinkAccount',
      contractVersion: this._accountVersion,
      chainId: this._chainId,
      method: 'metaDelegateCall',
      paramTypes: metaDelegateCallSignedParamTypes,
      params: [ StrategyTargetAddress, strategyData.data ]
    })
    return {
      hash: typedDataHash,
      account: accountAddress,
      signer: await this._signer.getAddress(),
      chainId: this._chainId,
      signatureType: 'EIP712',
      signature,
      strategy: strategyData
    }
  }

  async signMetaDelegateCall (toAddress: string, call: any) {
    const signedFnCall = await this.signFunctionCall(
      'metaDelegateCall',
      metaDelegateCallSignedParamTypes,
      new Map<number, any>([
        [0, toAddress],
        [1, call]
      ])
    )
    return signedFnCall
  }

  async signFunctionCall (functionName: string, paramTypes: Map<number, any>, params: Map<number, any>) {
    const encodedParams: Map<number, any> = new Map<number, any>()
    for (const [i, typeData] of paramTypes.entries()) {
      const p = params.get(i)
      if (typeData.calldata) {
        const callEncoded = encodeFunctionCall({
          functionName: p.functionName,
          paramTypes: p.paramTypes,
          params: [ ...p.params.values() ]
        })
        encodedParams.set(i, callEncoded)
      } else {
        encodedParams.set(i, params.get(i).toString())
      }
    }

    const { typedData, typedDataHash, signature: sigFromSigner } = await signEIP712({
      signer: this._signer,
      contractAddress: await this.accountAddress(),
      contractName: 'BrinkAccount',
      contractVersion: this._accountVersion,
      chainId: this._chainId,
      method: functionName,
      paramTypes,
      params: [ ...encodedParams.values() ]
    })

    const signerAddress = await this._signer.getAddress()
    const { signature } = sigToValidECDSA(sigFromSigner)

    return {
      message: typedDataHash,
      EIP712TypedData: typedData,
      signature,
      signer: signerAddress,
      accountAddress: await this.accountAddress(),
      functionName,
      signedParams: parseParams(paramTypes, params)
    }
  }
}

function parseParams (paramTypes: Map<number, any>, params: Map<number, any>) {
  const paramsArray = new Map<number, any>()
  for (const [i, value] of paramTypes.entries()) {
    const { name, type, calldata } = value
    paramsArray.set(i, {
      name,
      type
    })
    const p = params.get(i)
    const paramsObj = p && p.params ? {
      functionName: p.functionName,
      paramTypes: p.paramTypes,
      params: [ ...p.params.values() ]
    } : p
    if (calldata) {
      paramsArray.set(i, {
        ...paramsArray.get(i),
        value: encodeFunctionCall(paramsObj),
        callData: {
          functionName: params.get(i).functionName,
          params: parseParams(params.get(i).paramTypes, params.get(i).params)
        }
      })
    } else {
      paramsArray.set(i, {
        ...paramsArray.get(i),
        value: paramsObj
      })
    }
  }
  return [ ...paramsArray.values() ]
}

export default AccountSigner