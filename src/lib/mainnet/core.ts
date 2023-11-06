import { mainnet_read_client } from "../../clients/viem.js";
import { parseUnits } from "viem";

/** 
 * Return unix timestamp in SECOND (Javascript Date() constructor requires milliseconds input)
 * */
export async function getBlockTimestamp(blockNumber: number) {
  return mainnet_read_client
    .getBlock({ blockNumber: parseUnits(blockNumber.toString(), 0) })
    .then((block) => block.timestamp);
}

/** 
 * Return current block info
 * */
export async function getCurrentBlock() {
  return mainnet_read_client.getBlock();
}

export const BASE_BLOCK = 171165950;
export const BASE_TIMESTAMP = 1682943743;
export function calculateBlockTimestamp(blockNumber: number) {
  return (blockNumber - BASE_BLOCK) * 12 + BASE_TIMESTAMP;
}
