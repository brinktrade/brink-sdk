import { filter } from 'lodash'
import { SegmentFunctionName, SegmentParamType, SegmentParamValue } from '@brinkninja/types'
import { validateAddress, validateBytes, validateUint } from '.'

export default function verifyParams ({
  functionName,
  types,
  values
}: {
  functionName: `${SegmentFunctionName}`
  types: SegmentParamType[],
  values: SegmentParamValue[]
}) {
  const signedParamTypes = filter(types, { signed: true })

  const numParams = signedParamTypes.length
  const numParamVals = values.length
  if (numParams !== numParamVals) {
    throw new Error(`Invalid number of params provided for ${functionName}: expected ${numParams} but got ${numParamVals}`)
  }

  for (const i in values) {
    const v = values[i]
    const t = signedParamTypes[i]

    if (typeof v === 'undefined') {
      throw new Error(`Missing param '${t.name}' for ${functionName}`)
    }

    if (t.type === 'address') {
      validateAddress(t.name, v.toString())
    } else if (t.type === 'bytes') {
      validateBytes(t.name, v.toString())
    } else if (t.type.slice(0, 4) === 'uint') {
      validateUint(t.name, BigInt(v.toString()), parseInt(t.type.slice(4)))
    }
  }
}
