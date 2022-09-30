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

class AccountSigner {

  constructor ({ signer, chainId }) {
    this._signer = signer
    this._chainId = chainId
    this._accountVersion = '1'

    VERIFIERS.forEach(({ contractName, functionName, contractAddress, paramTypes }) => {
      // create a signer function for each Verifier
      const fnName = `sign${capitalize(functionName)}`

      const segments = [contractName, fnName]

      addSegmentedObj(this, segments, (async function () {
        let paramValuesMap
        if (_.isObject(arguments[0]) && !isBigNumber(arguments[0])) {
          paramValuesMap = arguments[0]
        } else {
          paramValuesMap = {}
          _.forEach(arguments, (paramVal, i) => {
            paramValuesMap[paramTypes[i].name] = paramVal
          })
        }

        try {
          verifyParamInput(paramValuesMap, paramTypes)
        } catch (err) {
          throw new Error(`${fnName}: ${err.stack}`)
        }

        // change contract token types to `address`
        const parsedParamTypes = _.map(paramTypes, t => ({...t, type: tokenTypes.includes(t.type) ? 'address' : t.type }))
        
        // get array of param values
        const params = _.filter(parsedParamTypes, { signed: true }).map(paramType => {
          // convert BN's to strings
          const pVal = paramValuesMap[paramType.name]
          return isBigNumber(pVal) ? pVal.toString() : pVal
        })
        const call = { functionName, paramTypes: parsedParamTypes, params }

        // sign the call to the verifier
        const signedCall = await this.signMetaDelegateCall(contractAddress, call)
        return signedCall
      }).bind(this))

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

  async signMetaDelegateCall (toAddress, call) {
    const signedFnCall = await this.signFunctionCall(
      'metaDelegateCall',
      metaDelegateCallSignedParamTypes,
      [ toAddress, call ]
    )
    return signedFnCall
  }

  async signFunctionCall (functionName, paramTypes, params) {
    let encodedParams = []
    for (let i in params) {
      const typeData = paramTypes[i]
      if (typeData.calldata) {
        const callEncoded = encodeFunctionCall(params[i])
        encodedParams[i] = callEncoded
      } else {
        encodedParams[i] = params[i].toString()
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
      params: encodedParams
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

function parseParams (paramTypes, params) {
  let paramsArray = []
  for (let i in paramTypes) {
    const { name, type, calldata } = paramTypes[i]
    paramsArray[i] = {
      name,
      type
    }
    if (calldata) {
      paramsArray[i].value = encodeFunctionCall(params[i])
      paramsArray[i].callData = {
        functionName: params[i].functionName,
        params: parseParams(params[i].paramTypes, params[i].params)
      }
    } else {
      paramsArray[i].value = params[i]
    }
  }
  return paramsArray
}

module.exports = AccountSigner
