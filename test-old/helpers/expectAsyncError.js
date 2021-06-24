const { expect } = require('chai')

async function expectAsyncError(promise, expectedErrorMessage) {
  try {
    await promise
    expect.fail('Expected an error but none was received')
  } catch (error) {
    if (expectedErrorMessage) {
      expect(error.message).to.equal(expectedErrorMessage)
    } else {
      expect(error).not.to.be.undefined
    }
  }
}

module.exports = expectAsyncError
