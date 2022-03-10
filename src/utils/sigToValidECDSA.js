const { isHex } = require('web3-utils')

function sigToValidECDSA (signature) {
  if (!signature || signature.length !== 132 || signature.slice(0,2) !== '0x' || !isHex(signature)) {
    throw new Error(`sigToValidECDSA: Invalid signature: ${signature}`)
  }

  const r = lower(signature.slice(2, 2+64))
  const s = lower(signature.slice(2+64, 2+64+64))
  let v = lower(signature.slice(2+64+64, 2+64+64+64+2))

  if (v !== '00' && v !== '01' && v !== '1b' && v !== '1c') {
    throw new Error(`sigToValidECDSA: Invalid \'v\' value: ${signature}`)
  }

  // convert to valid v values for ECDSA lib.
  // some signers, ledger for example, sign with 0/1 instead of 27/28 for v values,
  // and openzeppelin ECDSA library considers these invalid
  if (v == '00') v = '1b'
  else if (v == '01') v = '1c'

  return {
    signature: `0x${r}${s}${v}`,
    r, s, v
  }
}

const lower = s => s.toLowerCase()

module.exports = sigToValidECDSA
