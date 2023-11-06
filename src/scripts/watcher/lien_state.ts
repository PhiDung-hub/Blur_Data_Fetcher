import { parseAbi } from "viem";
import { Log } from "viem";

import { mainnet_read_client } from "../../clients/viem.js";
import {
  BLEND_CONTRACT, BLEND_EVT_LoanOfferTaken, BLEND_EVT_Refinance,
  BLEND_EVT_Repay, BLEND_EVT_Seize, BLEND_EVT_StartAuction
} from "../../lib/constants.js";
import { decodeLog } from "../../lib/decode.js";
import { groupLogsIntoTransactions, resolveTransaction } from "../../lib/resolver.js";
import { collectBlocks, collectLienOps } from "../../lib/mainnet/collect.js";
import { getCurrentBlock } from "../../lib/mainnet/core.js";
import { retrieveLastBlock, estimateLastComputedBlock, CompositeOp } from "../../lib/prisma/retrieve.js";
import { cacheBlock, cacheLienOps } from "../../lib/prisma/store.js";
import { updateLiens } from "../../lib/mainnet/aggregate.js";
import { exhaustGenerator } from "../../lib/utils/async.js";

import { wsBroadcast } from "../../service/wss.js";
import { initializeServers } from "../../service/bootstrap.js";

// NOTE: Requirements for the script:
// 1. Check data up-to-date status. (JUST RUN COLLECTOR). If data is not up-to-date, run viem_collector and state builder to upgrade lien states.
// 2. Initialize the watcher to subscribe to on-chain events
// 3. Batch dump into the database.
export default async function main() {
  initializeServers();
  // Task 1
  async function updateLienOpCache() {
    const currentBlock = Number((await getCurrentBlock()).number);
    const lastBlockCached = (await retrieveLastBlock())?.block;
    const estimatedLastLienOpBlock = await estimateLastComputedBlock();


    console.log("\nCollecting block informations");
    await exhaustGenerator(collectBlocks({ fromBlock: lastBlockCached! + 1, toBlock: currentBlock }));

    console.log("Collecting historical lien operations && Updating lien states\n");
    const collector = collectLienOps({ fromBlock: estimatedLastLienOpBlock + 1, toBlock: currentBlock, out: true });
    for await (const newOps of collector) {
      const compositeOps = newOps.map(op => {
        const { hash, ...rest } = op.payload;
        return rest;
      }) as CompositeOp[];
      // Update lien states to current time
      await updateLiens(compositeOps);
    }
  }

  console.log(`\n\`watcher/lien_State.ts\`- Task 1: updating lien states from to current date`);
  // Run 3 times to decrease the possibility of miscached -> close to 0!
  await updateLienOpCache();
  await updateLienOpCache();
  await updateLienOpCache();
  console.log(`\`watcher/lien_State.ts\`- Task 1: DONE\n`);


  console.log(`\n\`watcher/lien_State.ts\`- Task 2: Subscribing to on-chain events`);

  async function processLogs(logs: Log[]) {
    const decodedLogs = logs.map((log) => decodeLog(log));
    const transactions = await groupLogsIntoTransactions(decodedLogs);

    const lienOps = transactions.flatMap(tx => resolveTransaction(tx));
    await cacheLienOps(lienOps);
    console.log("Cached operations: ", lienOps);

    let compositeOps = lienOps.map(op => {
      const { hash, ...rest } = op.payload;
      return rest;
    }) as CompositeOp[];

    const newLienStates = await updateLiens(compositeOps);
    return newLienStates;
  }

  // on-chain watcher
  const unwatch = mainnet_read_client.watchEvent({
    address: BLEND_CONTRACT,
    events: parseAbi([
      BLEND_EVT_LoanOfferTaken,
      BLEND_EVT_Repay,
      BLEND_EVT_Seize,
      BLEND_EVT_StartAuction,
      BLEND_EVT_Refinance
    ]),
    onLogs: async (logs) => {
      const newLienStates = await processLogs(logs);
      wsBroadcast(newLienStates);
      console.log("Boardcasted to WS clients");
    }
  });

  const fetchBlocks = setInterval(async () => {
    const currentBlock = await getCurrentBlock();
    await cacheBlock({
      block: Number(currentBlock.number),
      time: Number(currentBlock.timestamp)
    })
  }, 12_000);

  const unwatch2 = () => {
    clearInterval(fetchBlocks)
  }

  return [unwatch, unwatch2];
}

const [unwatch, unwatch2] = await main();

// setTimeout(() => unwatch2(), 120_000);
// setTimeout(() => unwatch(), 60_000);
