import { isEqual } from 'lodash'
import { TokenAmount } from '@brinkninja/types'

export default function groupAndSumTokenAmounts(tokenAmounts: TokenAmount[]): TokenAmount[] {
  return tokenAmounts.reduce((acc: TokenAmount[], curr: TokenAmount) => {
      const tokenAmount = acc.find(a => isEqual(a.token, curr.token));

      if (tokenAmount) {
        tokenAmount.amount = (BigInt(tokenAmount.amount) + BigInt(curr.amount)).toString()
      } else {
          acc.push({ ...curr });
      }

      return acc;
  }, []);
}
