import { createPublicClient, createTestClient, createWalletClient, http, publicActions, walletActions } from "viem";
import { mainnet } from "viem/chains";

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

export const mainnet_read_client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.MAINNET_RPC ?? undefined)
});
export type MainnetReadClient = typeof mainnet_read_client;

// import { privateKeyToAccount } from "viem/accounts";
// const account = privateKeyToAccount("0x1231231");
// export const write_client = createWalletClient({
//   account,
//   chain: mainnet,
//   transport: http(process.env.MAINNET_RPC || undefined)
// })


export const test_client = createTestClient({
  account: process.env.IMPERSONATE_ADDRESS! as `0x${string}`,
  chain: mainnet,
  mode: 'anvil',
  transport: http("http://127.0.0.1:8545"),
}).extend(publicActions).extend(walletActions);
export type TestClient = typeof test_client;

// async function main() {
//   const block = await test_client.getBlockNumber();
//   console.log(block);
// }
// main()
