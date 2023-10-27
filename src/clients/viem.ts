import { createPublicClient, createTestClient, http } from "viem";
import { mainnet, foundry } from "viem/chains";

export const mainnet_client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

export const test_client = createTestClient({
  chain: mainnet,
  mode: 'anvil',
  transport: http()
})

async function main() {
  await test_client.impersonateAccount({
    address: '0xa5cc3c03994DB5b0d9A5eEdD10CabaB0813678AC',
  })
}
main()
