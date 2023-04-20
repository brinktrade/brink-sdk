const strategiesConstants = require('@brinkninja/strategies/constants')

const config = {
  ...strategiesConstants,
  UNIV3_FACTORY: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
}

export type ConfigKey = keyof typeof config

export default config
