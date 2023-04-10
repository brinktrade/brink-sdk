import { InvalidReason, ValidationResult, invalidReasonMessages } from './StrategyTypes'

export function invalidResult (reason: InvalidReason): ValidationResult {
  return {
    valid: false,
    reason,
    message: invalidReasonMessages[reason]
  }
}

export function validResult (): ValidationResult {
  return { valid: true }
}
