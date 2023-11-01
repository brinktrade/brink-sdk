import { TokenRegistry } from "@brink-sdk/internal";

const registry = TokenRegistry.getInstance();

export const USDC_TOKEN = registry.getByAddressOrSymbol("USDC", 1);
export const DAI_TOKEN =  registry.getByAddressOrSymbol("DAI", 1);
