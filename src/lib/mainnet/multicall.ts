import { mainnet_client } from "../../clients/viem.js";
import { parseAbi } from "viem";

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
