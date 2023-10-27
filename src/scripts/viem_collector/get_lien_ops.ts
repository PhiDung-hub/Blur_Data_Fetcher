import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { MultiBar, Presets } from "cli-progress";
import { parseAbi } from "viem";

import { mainnet_client } from "../../clients/viem.js";
import { BLEND_CONTRACT, BLEND_EVT_LoanOfferTaken, BLEND_EVT_Refinance, BLEND_EVT_Repay, BLEND_EVT_Seize, BLEND_EVT_StartAuction } from "../../lib/constants.js";
import { decodeLog } from "../../lib/decode.js";
import { groupLogsIntoTransactions, resolveTransaction } from "../../lib/resolver.js";
import { cacheLienOp } from "../../lib/prisma/stores.js";
import { sleep } from "../../lib/utils/async.js";


const multibar = new MultiBar({
  format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}",
  hideCursor: false,
  clearOnComplete: false,
});

async function getLienOps({ fromBlock = 17_165_950n, toBlock = undefined }: { fromBlock?: bigint, toBlock?: bigint }) {
  // if (!!fromBlock && !!toBlock && toBlock >= fromBlock + 800n) {
  //   throw new Error(`Range too big, must be less than 800 but received ${toBlock} - ${fromBlock} = ${toBlock - fromBlock}`);
  // }
  const rawLogs = await mainnet_client.getLogs({
    address: BLEND_CONTRACT,
    events: parseAbi([
      BLEND_EVT_LoanOfferTaken,
      BLEND_EVT_Repay,
      BLEND_EVT_Seize,
      BLEND_EVT_StartAuction,
      BLEND_EVT_Refinance
    ]),
    fromBlock,
    toBlock
  });
  return rawLogs;
}

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

  const { fromBlock, toBlock } = argv;

  // TODO: breakdown this into trunk of 1k blocks each.
  const TRUNK_SIZE = 800;
  let trunkStart = fromBlock;
  const computeTrunkEnd = (trunkStart: number) => {
    return trunkStart + TRUNK_SIZE > toBlock ? toBlock : trunkStart + TRUNK_SIZE;
  }

  const NUM_TASKS = (toBlock - fromBlock) / TRUNK_SIZE;
  const progressBar = multibar.create(NUM_TASKS, 0, {
    ...Presets.shades_grey,
  });

  while (trunkStart + TRUNK_SIZE <= toBlock) {
    const trunkEnd = computeTrunkEnd(trunkStart);
    const rawLogs = await getLienOps({ fromBlock: BigInt(trunkStart), toBlock: BigInt(trunkEnd) });
    const decodedLogs = rawLogs.map((log) => decodeLog(log));
    const transactions = await groupLogsIntoTransactions(decodedLogs);

    for (const tx of transactions) {
      const dbLienState = resolveTransaction(tx);
      await cacheLienOp(dbLienState);
      // console.log("Cached state", dbLienState);
    }

    trunkStart += TRUNK_SIZE;
    progressBar.increment()

    await sleep(300); // make sure RPC Provider don't flag as DoS.
  }
  progressBar.update(NUM_TASKS);

  multibar.stop();
}

main()
