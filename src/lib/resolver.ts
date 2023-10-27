// Resolve Blend events emitted from transaction into update logic for the database
import { LienState } from "../stores.js";
import { BlendEvent } from "./decode.js";

export type Transaction = {
  block: number,
  hash: `0x${string}`,
  time: string,
  events: BlendEvent[]
}

export function resolveTransaction(transaction: Transaction): LienState {
  const { events, block, hash, time } = transaction;

  const { data, type } = events[0];
  switch (type) {
    // DELETE if evt = Repay | Seize
    case "Repay":
    case "Seize":
      return {
        payload: {
          hash,
          block,
          time,
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
          time,
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
            time,
            event_type: "CREATE",
            lienId: data.lienId,
            collection: data.collection,
            lender: data.lender,
            borrower: data.borrower,
            tokenId: data.tokenId,
            amount: data.loanAmount.toString(),
            rate: data.rate,
            auctionDuration: data.auctionDuration,
            startTime: 0,
            auctionStartBlock: block,
          },
          schema: "CREATE"
        }
      } else {
        // a refinance
        return {
          payload: {
            hash,
            block,
            time,
            event_type: "UPDATE",
            lienId: data.lienId,
            collection: data.collection,
            lender: data.lender,
            amount: data.loanAmount.toString(),
            rate: data.rate,
            auctionDuration: data.auctionDuration,
            startTime: 0,
            auctionStartBlock: block,
          },
          schema: "REFINANCE"
        }
      }
  }
}

