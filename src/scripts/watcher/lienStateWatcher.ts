import { mainnet_client } from "../../clients/viem.js";
import { BLEND_CONTRACT, BLEND_EVT_LoanOfferTaken, BLEND_EVT_Refinance, BLEND_EVT_Repay, BLEND_EVT_Seize, BLEND_EVT_StartAuction } from "../../lib/constants.js";
import { parseAbi } from "viem";
import { Log } from "viem";
import { decodeLog } from "../../lib/decode.js";
import { groupLogsIntoTransactions, resolveTransaction } from "../../lib/resolver.js";

async function processLogs(logs: Log[]) {
  const decodedLogs = logs.map((log) => decodeLog(log));

  const transactions = await groupLogsIntoTransactions(decodedLogs);

  // cache updated state in the database
  for (const tx of transactions) {
    const dbLienState = resolveTransaction(tx);
    // await cacheLienOp(dbLienState);
    console.log("Cached state", dbLienState);
  }
}

function main() {
  // on-chain watcher
  const unwatch = mainnet_client.watchEvent({
    address: BLEND_CONTRACT,
    events: parseAbi([
      BLEND_EVT_LoanOfferTaken,
      BLEND_EVT_Repay,
      BLEND_EVT_Seize,
      BLEND_EVT_StartAuction,
      BLEND_EVT_Refinance
    ]),
    onLogs: logs => {
      processLogs(logs);
    }
  });

  const process2 = setInterval(() => {
    // console.log("Another async task...\n");
  }, 12_000);

  const unwatch2 = () => {
    clearInterval(process2)
  }

  return [unwatch, unwatch2];
}

const [unwatch, unwatch2] = main();

// setTimeout(() => unwatch2(), 120_000);
// setTimeout(() => unwatch(), 60_000);
