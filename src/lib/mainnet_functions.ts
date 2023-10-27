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

///////////////// UniswapV3 /////////////////
const UniswapV3Factory = {
  address: "0x1F98431c8aD98523631AE4a59f267346ea31F984", // mainnet
  abi: parseAbi([
    // @ts-ignore
    "function getPool(address tokenA, address tokenB, uint24 fee) external view returns (address pool)",
  ]),
};

const UniswapV3Pool = {
  abi: parseAbi([
    // @ts-ignore
    "function tickSpacing() external view returns (int24)",
    // @ts-ignore
    "function positions(bytes32 key) external view returns (uint128 _liquidity, uint256 feeGrowthInside0LastX128, uint256 feeGrowthInside1LastX128, uint128 tokensOwed0, uint128 tokensOwed1)",
  ]),
};

export async function getPoolAddress(
  tokenA: string,
  tokenB: string,
  feeTier: number
) {
  return mainnet_client
    .readContract({
      ...UniswapV3Factory,
      // @ts-ignore
      functionName: "getPool",
      args: [tokenA, tokenB, feeTier],
    })
    .then((result) => (result as string).toLowerCase() as `0x${string}`);
}

export async function getPositionInfo(
  address: `0x${string}`,
  positionId: `0x${string}` // bytes32 id
) {
  return mainnet_client
    .readContract({
      address,
      abi: UniswapV3Pool.abi,
      // @ts-ignore
      functionName: "positions",
      args: [positionId],
    })
    .then((result) => {
      let r = result as [bigint, bigint, bigint, bigint, bigint];
      return {
        liquidity: r[0],
        feeGrowthInside0LastX128: r[1],
        feeGrowthInside1LastX128: r[2],
        tokensOwed0: r[3],
        tokensOwed1: r[4],
      };
    });
}
/////////////////////////////////////////////
