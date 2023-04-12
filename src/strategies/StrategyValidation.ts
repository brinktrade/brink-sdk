import Token from './Token'
import { TokenStandard } from './StrategyTypes'
import { validateAddress, validateFixedBytes, validateUint, validateBoolean, validateEnum } from '../utils/SolidityValidation'

export function validateToken(paramName: string, token: Token): void {
  validateEnum(`${paramName}.standard`, TokenStandard, token.standard)
  validateAddress(`${paramName}.addr`, token.addr)
  validateFixedBytes(`${paramName}.idsMerkleRoot`, token.idsMerkleRoot, 32)
  validateUint(`${paramName}.id`, token.id, 256)
  validateBoolean(`${paramName}.disallowFlagged`, token.disallowFlagged)
}
