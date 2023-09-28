import find from 'lodash/find'

const { ACCOUNT, DEPLOY_AND_CALL, ACCOUNT_FACTORY } = require('@brinkninja/core/constants')

const intentGroupsConstants = require('@brinkninja/strategies/constants')
const { VERIFIERS } = require('@brinkninja/config').mainnet

const config = {
  ...intentGroupsConstants,
  ACCOUNT,
  DEPLOY_AND_CALL,
  ACCOUNT_FACTORY,
  UNIV3_FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
  CANCEL_VERIFIER: find(VERIFIERS, { contractName: 'CancelVerifier' }).contractAddress
}

export type ConfigKey = keyof typeof config

export default config
