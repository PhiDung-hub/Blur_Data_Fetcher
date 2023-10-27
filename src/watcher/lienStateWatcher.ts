import { viem_client } from "../clients/viem.js";
import { BLEND_CONTRACT, BLEND_EVT_LoanOfferTaken, BLEND_EVT_Refinance, BLEND_EVT_Repay, BLEND_EVT_Seize, BLEND_EVT_StartAuction } from "../lib/constants.js";
import { BLEND_EVT_LoanOfferTaken_SELECTOR, BLEND_EVT_Refinance_SELECTOR, BLEND_EVT_Repay_SELECTOR, BLEND_EVT_Seize_SELECTOR, BLEND_EVT_StartAuction_SELECTOR } from "../lib/constants.js";
import { parseAbi } from "viem";
import { Log } from "viem";
import { BlendEvent, decodeLoanOfferTaken, decodeRefinance, decodeRepay, decodeSeize, decodeStartAuction } from "../lib/decode.js";
import { Transaction, resolveTransaction } from "../lib/resolver.js";
import { getBlockTimestamp } from "../lib/viem_functions.js";
import { cacheLienState } from "../stores.js";

async function processLogs(logs: Log[]) {
  const decodedLogs = logs.map((log) => {
    const evtSelector = log.topics[0];
    const data = log.data;
    // pending tx can't emit events -> transaction must be resolved
    const block = log.blockNumber!;
    const hash = log.transactionHash!;

    let decodedEvent: BlendEvent | null = null;

    switch (evtSelector) {
      case BLEND_EVT_LoanOfferTaken_SELECTOR:
        decodedEvent = {
          data: decodeLoanOfferTaken(data),
          type: "LoanOfferTaken"
        }
        break;

      case BLEND_EVT_Repay_SELECTOR:
        decodedEvent = {
          data: decodeRepay(data),
          type: "Repay"
        }
        break;

      case BLEND_EVT_Seize_SELECTOR:
        decodedEvent = {
          data: decodeSeize(data),
          type: "Seize"
        }
        break;

      case BLEND_EVT_StartAuction_SELECTOR:
        decodedEvent = {
          data: decodeStartAuction(data),
          type: "StartAuction"
        }
        break;

      case BLEND_EVT_Refinance_SELECTOR:
        decodedEvent = {
          data: decodeRefinance(data),
          type: "Refinance"
        }
        break;
    }

    return {
      block,
      hash,
      event: decodedEvent!
    }
  });

  // group logs into transactions
  let tx_map: { [key: `0x${string}`]: { block: bigint, events: BlendEvent[] } } = {};
  for (const l of decodedLogs) {
    const hash = l.hash;
    if (!tx_map[hash]) {
      tx_map[hash] = {
        block: l.block,
        events: [l.event]
      }
    } else {
      tx_map[hash].events.push(l.event)
    }
  }

  const resolvingTransactions: Promise<Transaction>[] = Object.entries(tx_map).map(async ([hash, details]) => {
    const { block, events } = details;
    const time = await getBlockTimestamp(Number(block));

    return {
      block: Number(block),
      hash: hash as `0x${string}`,
      time: Number(time),
      events
    }
  })

  const transactions = await Promise.all(resolvingTransactions);

  // cache updated state in the database
  for (const tx of transactions) {
    const dbLienState = resolveTransaction(tx);
    // await cacheLienState(dbLienState);
    console.log("Cached state", dbLienState);
  }
}

function main() {
  // on-chain watcher
  const unwatch = viem_client.watchEvent({
    address: BLEND_CONTRACT,
    // @ts-ignore
    events: parseAbi([
      // @ts-ignore
      BLEND_EVT_LoanOfferTaken,
      // @ts-ignore
      BLEND_EVT_Repay,
      // @ts-ignore
      BLEND_EVT_Seize,
      // @ts-ignore
      BLEND_EVT_StartAuction,
      // @ts-ignore
      BLEND_EVT_Refinance
    ]),
    onLogs: logs => {
      processLogs(logs);
    }, // categorize types
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

