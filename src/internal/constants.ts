export const MetaDelegateCallSignedParamTypes = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes', calldata: true }
]

export const MetaDelegateCall_EIP1271SignedParamTypes = [
  { name: 'to', type: 'address' },
  { name: 'data', type: 'bytes', calldata: true }
]

export const X96 = BigInt(2)**BigInt(96)
