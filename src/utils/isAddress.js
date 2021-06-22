const isAddress = function (address) {
  return (/^(0x)?[0-9a-f]{40}$/i.test(address))
}

module.exports = isAddress
