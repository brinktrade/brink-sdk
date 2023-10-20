import { BigNumber } from 'ethers';
import Joi from 'joi';
import { isNumber } from 'lodash';
import web3Utils from 'web3-utils';

const DEFAULT_UINT_SIZE = 256;

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
        'bigIntish.min': '{{#value}} is less than the minimum allowed value of {{#minValue}}',
        'bigIntish.max': '{{#value}} is greater than the maximum allowed value of {{#maxValue}}',
      },
      type: 'bigIntish',
      validate (value: any, helpers: any) {
        if (!isBigIntish(value)) {
          return { errors: helpers.error('bigIntish.base'), value, };
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

  .extend((joi: any) => {
    return {
      base: joi.bigIntish(),
      messages: {
        'uint.base': '{{#value}} is not a valid uint',
        'uint.range': '{{#value}} is out of the range for uint{{#size}}',
      },
      type: 'uint',
      // this is necessary to go through a rule because top level extensions can't parse arguments in the validate function.
      args(base: any, size: any) {
        // @ts-ignore
        return base.size(size);
      },
      validate(value: any, helpers: any, args: any) {
        const size: number = helpers.schema.$_getFlag("size") || DEFAULT_UINT_SIZE;
        const maxValue = BigInt(2**size - 1);

        const baseSchema = joi.bigIntish().min(0).max(maxValue.toString());
        const { error } = baseSchema.validate(value);

        if (error) {
          return { errors: helpers.error('uint.range', { size }), value, };
        }
      },
      rules: {
        size: {
          method(size: any): any {
            // @ts-ignore: Unreachable code error
            return this.$_setFlag("size", size);
          },
          args: [
            {
              name: 'sizeValue',
              ref: true,
              assert: (size: any) => Number.isInteger(size) && [8, 16, 32, 64, 128, 256].includes(size),
              message: 'must be a number or string representing an integer'
            }
          ]
        }
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
