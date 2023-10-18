import { BigNumber } from 'ethers';
import Joi from 'joi';
import web3Utils from 'web3-utils';

const MAX_UINT256 = BigInt(2**256 - 1);

export const joi = Joi
  // validates ethereum address
  .extend((joi: Joi.Root) => {
    return {
      base: joi.string(),
      messages: {
        'ethereumAddress.base': '{{#value}} is not a valid ethereum address'
      },
      type: 'ethereumAddress',
      validate (value, helpers) {
        if (!web3Utils.isAddress(value)) {
          return { errors: helpers.error('ethereumAddress.base'), value, };
        }
      }
    };
  })

  .extend((joi: Joi.Root) => {
    return {
      base: joi.alternatives().try(joi.string(), joi.number()),
      messages: {
        'bigIntish.base': '{{#value}} is not a valid bigIntish',
        'bigIntish.uint256': '{{#value}} should be uint256',
        'bigIntish.min': '{{#value}} is less than the minimum allowed value of {{#minValue}}',
        'bigIntish.max': '{{#value}} is greater than the maximum allowed value of {{#maxValue}}',
      },
      type: 'bigIntish',
      validate (value: any, helpers: any) {
        if (!isBigIntish(value)) {
          return { errors: helpers.error('bigIntish.base'), value, };
        }

        if (BigInt(value) > MAX_UINT256) {
          return { errors: helpers.error('bigIntish.uint256'), value, };
        }
      },
      rules: {
        min: {
          method(minValue: any): any {
            // @ts-ignore: Unreachable code error
            return this.$_addRule({ name: 'min', args: { minValue } });
          },
          args: [
            {
              name: 'minValue',
              ref: true,
              // should validate that q is a bigIntish. should convert to big int and compare to the arg value
              assert: (value: any) => isBigIntish(value),
              message: 'must be a number or string representing an integer'
            }
          ],
          validate (value: any, helpers: any, args: any, options: any) {
            if (BigInt(value) < BigInt(args.minValue)) {
              return helpers.error('bigIntish.min', { minValue: args.minValue });
            }

            return value
          }
        },
        max: {
          method(maxValue: any): any {
            // @ts-ignore: Unreachable code error
            return this.$_addRule({ name: 'max', args: { maxValue } });
          },
          args: [
            {
              name: 'maxValue',
              ref: true,
              // should validate that q is a bigIntish. should convert to big int and compare to the arg value
              assert: (value: any) => isBigIntish(value),
              message: 'must be a number or string representing an integer'
            }
          ],
          validate (value: any, helpers: any, args: any, options: any) {
            if (BigInt(value) > BigInt(args.maxValue)) {
              return helpers.error('bigIntish.max', { maxValue: args.maxValue });
            }

            return value
          }
        },
      }
    };
  })

function isBigIntish(value: any) {
  try {
    BigInt(value);
    return true;
  } catch (e) {
    return false;
  }
}
