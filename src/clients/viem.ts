import { createPublicClient, createTestClient, http } from "viem";
import { mainnet } from "viem/chains";

import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

// console.log("Custom mainnet RPC: ", process.env.MAINNET_RPC);

export const mainnet_client = createPublicClient({
  chain: mainnet,
  transport: http(process.env.MAINNET_RPC ?? undefined),
});

export const test_client = createTestClient({
  chain: mainnet,
  mode: 'anvil',
  transport: http(),
})

// async function main() {
//   await test_client.impersonateAccount({
//     address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
//   })
// }
// main()
