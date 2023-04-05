type ConfigKey =
  'PRIMITIVES_CONTRACT' |
  'STRATEGY_CONTRACT'

const config: Map<ConfigKey, string | number> = new Map([
  ['PRIMITIVES_CONTRACT', '0xD35d062aC72C7afE566b1002819d129b6DfF3d34'],
  ['STRATEGY_CONTRACT', '0x0a8A4c2aF510Afe2A40D230696cAcA6967f75BbF'],
])

export default config
