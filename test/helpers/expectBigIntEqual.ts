import { expect } from 'chai'

async function expectBigIntEqual(a: BigInt, b: BigInt) {
  expect(a.toString()).to.equal(b.toString())
}

export default expectBigIntEqual
