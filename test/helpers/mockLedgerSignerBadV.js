const randomSigner = require('./randomSigner')

async function mockLedgerSignerBadV () {
  const rndSigner = await randomSigner()

  const fn = rndSigner._signTypedData
  rndSigner._signTypedData = (async function (domain, types, value) {
    const signature = await fn.call(rndSigner, domain, types, value)

    // mock in a bad 'v' value to mock ledger's bad behavior .. changes 1b to 00, and 1c to 01
    const v = signature.slice(2+64+64, 2+64+64+2)
    const badV = v == '1b' ? '00' : '01'

    // return the signature string with the bad v value
    return `${signature.slice(0, 2+64+64)}${badV}`
  }).bind(rndSigner)

  return rndSigner
}

module.exports = mockLedgerSignerBadV
