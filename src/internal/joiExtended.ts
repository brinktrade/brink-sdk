import { BigNumber } from 'ethers';
import Joi from 'joi';
import web3Utils from 'web3-utils';

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
        'bigIntish.min': 'min not satisfied'
      },
      type: 'bigIntish',
      validate (value: any, helpers: any) {
        if (!isBigIntish(value)) {
          return { errors: helpers.error('bigIntish.base'), value, };
        }
      },
      rules: {
        min: {
          method(q: any): any {
            // @ts-ignore: Unreachable code error
            return this.$_addRule({ name: 'min', args: { q } });
          },
          args: [
            {
              name: 'q',
              ref: true,
              // should validate that q is a bigIntish. should convert to big int and compare to the arg value
              assert: (value: any) => isBigIntish(value),
              message: 'must be a number or string representing an integer'
            }
          ],
          validate (value: any, helpers: any, args: any, options: any) {
            if (BigInt(value) < BigInt(args.q)) {
              return helpers.error('bigIntish.min', { q: args.q });
            }

            return value
          }
        }
      }
    };
  })


  // // validates positive bigintish
  // .extend((joi: Joi.Root) => {
  //   return {
  //     base: joi.alternatives().try(joi.string(), joi.number()),
  //     messages: {
  //       'bigIntishPositive.base': '{{#value}} is not a valid bigIntish',
  //       'bigIntishPositive.greaterThanZero': '{{#value}} should be greater than 0',
  //     },
  //     type: 'bigIntishPositive',
  //     validate (value: any, helpers: any) {
  //       if (!isBigIntish(value)) {
  //         return { errors: helpers.error('bigIntishPositive.base'), value, };
  //       }
  //       const bigValue = BigInt(value);
  //       if (bigValue <= 0) {
  //         return { errors: helpers.error('bigIntishPositive.greaterThanZero'), value, };
  //       }
  //     }
  //   };
  // })

function isBigIntish(value: any) {
  try {
    BigInt(value);
    return true;
  } catch (e) {
    return false;
  }
}
