import { mainnet_client } from "../clients/viem.js";
import { parseAbi, parseUnits } from "viem";

///////////// GENERAL FUNCTIONS /////////////
/** 
 * Return unix timestamp in SECOND (Javascript Date() constructor requires milliseconds input)
 * */
export async function getBlockTimestamp(blockNumber: number) {
  return mainnet_client
    .getBlock({ blockNumber: parseUnits(blockNumber.toString(), 0) })
    .then((block) => block.timestamp);
}

export async function getCurrentBlock() {
  return mainnet_client.getBlock().then((block) => block.number);
}


/////////////// EXAMPLE CALLS ///////////////
export async function getERC20TokensDecimals(tokenAddresses: `0x${string}`[]) {
  return mainnet_client
    .multicall({
      contracts: tokenAddresses.map((address) => ({
        address,
        abi: parseAbi([
          // @ts-ignore
          "function decimals() external view returns (uint8)",
        ]),
        functionName: "decimals",
      })),
    })
    .then((results) => {
      if (results.find((r) => r.error)) {
        throw new Error("Invalid token");
      }
      return results.map((token) => Number(token.result));
    });
}
