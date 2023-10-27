// Resolve Blend events emitted from transaction into update logic for the database
import { LienOp } from "./prisma/stores.js";
import { BlendEvent, DecodedLog } from "./decode.js";
import { formatISOString } from "./utils/conversion.js";
import { getBlockTimestamp } from "./mainnet_functions.js";

export type Transaction = {
  block: number,
  hash: `0x${string}`,
  time: number,
  events: BlendEvent[]
}

export function groupLogsIntoTransactions(decodedLogs: DecodedLog[]): Promise<Transaction[]> {
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

  const transactionPromises: Promise<Transaction>[] = Object.entries(tx_map).map(async ([hash, details]) => {
    const { block, events } = details;
    const time = await getBlockTimestamp(Number(block));

    return {
      block: Number(block),
      hash: hash as `0x${string}`,
      time: Number(time),
      events
    }
  })
  
  return Promise.all(transactionPromises)
}

export function resolveTransaction(transaction: Transaction): LienOp {
  const { events, block, hash, time } = transaction;

  const date = new Date(Number(time) * 1000);
  const dateString = formatISOString(date.toISOString());

  const { data, type } = events[0];
  switch (type) {
    // DELETE if evt = Repay | Seize
    case "Repay":
    case "Seize":
      return {
        payload: {
          hash,
          block,
          time: dateString,
          event_type: "DELETE",
          lienId: data.lienId,
          collection: data.collection
        },
        schema: "DELETE"
      }

    // AUCTION if evt = StartAuction
    case "StartAuction":
      return {
        payload: {
          hash,
          block,
          time: dateString,
          event_type: "AUCTION",
          lienId: data.lienId,
          collection: data.collection,
          auctionStartBlock: block,
        },
        schema: "AUCTION"
      }

    // UDDATE OR CREATE based on event stacks
    // case "LoanOfferTaken":
    // case "Refinance":
    default:
      if (events.length === 1 && type === "LoanOfferTaken") {
        // a new lien created
        return {
          payload: {
            hash,
            block,
            time: dateString,
            event_type: "CREATE",
            lienId: data.lienId,
            collection: data.collection,
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
        }
      } else {
        // a refinance
        return {
          payload: {
            hash,
            block,
            time: dateString,
            event_type: "UPDATE",
            lienId: data.lienId,
            collection: data.collection,
            lender: data.lender,
            amount: data.loanAmount.toString(),
            rate: data.rate,
            auctionDuration: data.auctionDuration,
            startTime: time,
            auctionStartBlock: 0,
          },
          schema: "REFINANCE"
        }
      }
  }
}


