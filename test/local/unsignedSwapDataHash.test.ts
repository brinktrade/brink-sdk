import { IdsProof, unsignedSwapDataHash } from '@brink-sdk/intents'
import { expect } from 'chai'

describe('unsignedSwapDataHash', () => {
  it('should correctly return an unsignedSwapDataHash', async function () {
    const ERC20_ADAPTER = '0xD1b8592EFCA1613c837F408419BBF0e4B85142D8'
    const dataHash: string = await unsignedSwapDataHash({
      recipient: ERC20_ADAPTER,
      tokenInIdsProof: new IdsProof(),
      tokenOutIdsProof: new IdsProof(),
      callData: {
        targetContract: ERC20_ADAPTER,
        data: '0x'
      }
    })

    expect(dataHash).to.equal('0x5a8d1a5e8dfa2b4ebb2b8bd88a97bca0a966778c71821e6295eedebed88afa79')
  })
})
