import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

export const viem_client = createPublicClient({
  chain: mainnet,
  transport: http(),
});

