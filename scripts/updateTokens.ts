import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

import { joi } from "../src/internal/joiExtended";

async function updateTokens() {
  try {
    const response = await fetch('https://gateway.ipfs.io/ipns/tokens.uniswap.org');
    const data = await response.json();

    // if an error occurs the script should stop
    const { error } = tokensSchema.validate(data);
    if (error) {
      throw error;
    }
    
    const filePath = path.join(__dirname, '..', 'src', 'internal', 'tokens.json');
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

    console.log('Successfully updated tokens.json');
  } catch (error) {
    console.error('Error updating tokens.json:', error);
  }
}

const tokensSchema = joi.object({
  tokens: joi.array().items(
    joi.object({
      chainId: joi.number().required(),
      address: joi.ethereumAddress().required(),
      symbol: joi.string().required(),
    }).unknown()
  )
}).unknown();

updateTokens();
