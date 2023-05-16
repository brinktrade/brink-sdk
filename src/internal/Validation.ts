import { InvalidReason, ValidationResult, invalidReasonMessages } from '@brinkninja/types'

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
