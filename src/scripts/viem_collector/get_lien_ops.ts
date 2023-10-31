import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { getCurrentBlock } from "../../lib/mainnet/core.js";
import { collectLienOps } from "../../lib/mainnet/Blend.js";
import { exhaustGenerator } from "../../lib/utils/async.js";


async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("fromBlock", {
      alias: "from",
      description: "Starting lien Id to process",
      number: true,
      default: 17_165_950
    })
    .option("toBlock", {
      alias: "to",
      description: "Final lien Id to process",
      number: true,
      default: 19_000_000
    })
    .help()
    .alias("help", "h")
    .parse();

  const { fromBlock } = argv;

  const currentBlock = Number((await getCurrentBlock()).number);
  const toBlock = Math.min(currentBlock, argv.toBlock);

  console.log(`\n\`viem_collector/get_blocks.ts\`: Fetching block information from ${fromBlock} to ${toBlock}...\n\n`);
  await exhaustGenerator(collectLienOps({ fromBlock, toBlock }));
}

main()
