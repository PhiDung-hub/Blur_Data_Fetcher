// Resolve Blend events emitted from transaction into update logic for the database
import { LienOp } from "./prisma/store.js";
import { BlendEvent, DecodedLog } from "./decode.js";
import { formatISOString } from "./utils/conversion.js";
import { getBlockTimestamp } from "./mainnet/core.js";
import { retrieveBlocks } from "./prisma/retrieve.js";
import { retryWrapper } from "./utils/async.js";

export type Transaction = {
  block: number,
  hash: `0x${string}`,
  time: number,
  events: BlendEvent[]
}

export async function groupLogsIntoTransactions(decodedLogs: DecodedLog[]): Promise<Transaction[]> {
  let tx_map: { [key: `0x${string}`]: { block: number, events: BlendEvent[] } } = {};
  for (const l of decodedLogs) {
    const hash = l.hash;

    if (tx_map[hash] === undefined) {
      tx_map[hash] = {
        block: Number(l.block),
        events: [l.event]
      }
    } else {
      tx_map[hash].events.push(l.event)
    }
  }

  const blockNumbers = Object.entries(tx_map).map(([_, { block }]) => block);
  const cachedBlocks = await retrieveBlocks(blockNumbers);
  const blockTimeMap = cachedBlocks.reduce((acc, { time, block }) => {
    acc[block] = time;
    return acc
  }, {} as { [key: number]: number });

  const transactionPromises: Promise<Transaction>[] = Object.entries(tx_map).map(async ([hash, details]) => {
    const { events, block } = details;
    let time = blockTimeMap[block];
    if (!time) {
      time = await retryWrapper({
        fn: async () => {
          return getBlockTimestamp(block);
        },
        fnIdentifier: "`groupLogsIntoTransactions.getBlockTimestamp`"
      });
    }

    return {
      block: block,
      hash: hash as `0x${string}`,
      time: Number(time),
      events
    }
  })

  return Promise.all(transactionPromises)
}

/** 
 * Decode an event from a transaction into corresponding lien op.
 * A single transaction can have multiple lien ops, e.g. Repay (delete a lien) then take new Loan (create a lien)
 * */
export function resolveTransaction(transaction: Transaction): LienOp[] {
  const { events, block, hash, time } = transaction;

  const date = new Date(Number(time) * 1000);
  const dateString = formatISOString(date.toISOString());
  let lienOps: LienOp[] = [];

  const types = events.map(e => e.type);

  const isRefinance = types.includes("Refinance");

  for (const event of events) {
    const { data, type } = event;
    const common = { hash, block, time: dateString, lienId: data.lienId, collection: data.collection };
    switch (type) {
      // DELETE if evt = Repay | Seize
      case "Repay":
      case "Seize":
        lienOps.push({
          payload: {
            ...common,
            event_type: "DELETE",
          },
          schema: "DELETE"
        });
        break;

      // AUCTION if evt = StartAuction
      case "StartAuction":
        lienOps.push({
          payload: {
            ...common,
            event_type: "UPDATE",
            auctionStartBlock: block,
          },
          schema: "AUCTION"
        });
        break;

      case "LoanOfferTaken":
        if (!isRefinance) {
          lienOps.push({
            payload: {
              ...common,
              event_type: "CREATE",
              lender: data.lender,
              borrower: data.borrower,
              tokenId: data.tokenId,
              amount: data.loanAmount.toString(),
              rate: data.rate,
              auctionDuration: data.auctionDuration,
              startTime: time,
              auctionStartBlock: 0,
            },
            schema: "CREATE"
          })
        }
        break;

      case "Refinance":
        // a refinance
        lienOps.push({
          payload: {
            ...common,
            event_type: "UPDATE",
            lender: data.lender,
            amount: data.loanAmount.toString(),
            rate: data.rate,
            auctionDuration: data.auctionDuration,
            startTime: time,
            auctionStartBlock: 0,
          },
          schema: "REFINANCE"
        })
        break;
    }
  }

  return lienOps;
}
