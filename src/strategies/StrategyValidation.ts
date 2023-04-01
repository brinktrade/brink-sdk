import { Token, TokenStandard } from './StrategyTypes'
import { validateAddress, validateFixedBytes, validateUint, validateBoolean, validateEnum } from '../utils/SolidityValidation'

export function validateToken(token: Token): void {
  validateEnum(TokenStandard, token.standard)
  validateAddress(token.addr)
  validateFixedBytes(token.idsMerkleRoot, 32)
  validateUint(token.id, 256)
  validateBoolean(token.disallowFlagged)
}
