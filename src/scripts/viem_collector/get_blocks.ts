import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { getCurrentBlock } from "../../lib/mainnet/core.js";
import { collectBlocks } from "../../lib/mainnet/collect.js";
import { exhaustGenerator } from "../../lib/utils/async.js";
import { BLUR_GENESIS_BLOCK } from "../../lib/constants.js";


export default async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("fromBlock", {
      alias: "f",
      description: "Starting lien Id to process",
      number: true,
      default: BLUR_GENESIS_BLOCK // current: 18_460_432
    })
    .option("toBlock", {
      alias: "t",
      description: "Final lien Id to process",
      number: true,
      default: 100_000_000
    })
    .help()
    .alias("help", "h")
    .parse();

  const { fromBlock } = argv;

  const currentBlock = Number((await getCurrentBlock()).number);
  const toBlock = Math.min(currentBlock, argv.toBlock);

  console.log(`\n\`viem_collector/get_lien_ops.ts\`: Fetching lien operations from block ${fromBlock} to ${toBlock}...\n\n`);
  await exhaustGenerator(collectBlocks({ fromBlock, toBlock }));
}

main()
