import { Headers } from 'node-fetch';
import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import { LienOp, cacheLienOp } from '../../lib/prisma/stores.js';

import { MultiBar, Presets } from "cli-progress";
const multibar = new MultiBar({
  format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}",
  hideCursor: false,
  clearOnComplete: false,
});



const DUNE_API_KEY = process.env.DUNE_API_KEY

// Add the API key to an header object
const meta = {
  "x-dune-api-key": DUNE_API_KEY!
};

const header = new Headers(meta);

type ResultRow = {
  hash: string;
  block: string; // string number
  time: string;
  event_type: 'CREATE' | 'UPDATE' | 'DELETE';

  lienId: string; // string number
  collection: string;

  lender: string | null;
  borrower: string | null;
  tokenId: string | null; // string number
  amount: string | null; // bigint stored as string
  rate: string | null; // string number
  auctionDuration: string | null; // string number
  startTime: string | null; // string number
  auctionStartBlock: string | null; // string number
}

function decode(row: ResultRow): LienOp {
  switch (row.event_type) {
    case 'CREATE': {
      return {
        payload: {
          hash: row.hash,
          block: Number(row.block),
          time: row.time,
          event_type: row.event_type,
          lienId: Number(row.lienId),
          collection: row.collection,
          lender: row.lender!,
          borrower: row.borrower!,
          tokenId: Number(row.tokenId!),
          amount: row.amount!.toString(),
          rate: Number(row.rate!),
          auctionDuration: Number(row.auctionDuration!),
          startTime: Number(row.startTime!),
          auctionStartBlock: Number(row.auctionStartBlock!),
        },
        schema: 'CREATE'
      }
    }

    case 'UPDATE': {
      if (Number(row.auctionStartBlock!) > 0) {
        return {
          payload: {
            hash: row.hash,
            block: Number(row.block),
            time: row.time,
            event_type: row.event_type,
            lienId: Number(row.lienId),
            collection: row.collection,
            auctionStartBlock: Number(row.auctionStartBlock!),
          },
          schema: 'AUCTION'
        }
      } else {
        return {
          payload: {
            hash: row.hash,
            block: Number(row.block),
            time: row.time,
            event_type: row.event_type,
            lienId: Number(row.lienId),
            collection: row.collection,
            lender: row.lender!,
            amount: row.amount!.toString(),
            rate: Number(row.rate!),
            auctionDuration: Number(row.auctionDuration!),
            startTime: Number(row.startTime!),
            auctionStartBlock: Number(row.auctionStartBlock!),
          },
          schema: 'REFINANCE'
        }
      }
    }

    case 'DELETE': {
      return {
        payload: {
          hash: row.hash,
          block: Number(row.block),
          time: row.time,
          event_type: row.event_type,
          lienId: Number(row.lienId),
          collection: row.collection,
        },
        schema: 'DELETE'
      }
    }

    default:
      throw new Error("Invalid input row")
  }
}

// NOTE: 300K ENTRIES COLLECTED
async function main() {
  //  Call the Dune API
  const queryId = 3141010;
  const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results`, {
    method: 'GET',
    headers: header
  });
  const body: any = await response.json();
  if (!body.result) {
    console.log("Empty result for query id -", queryId);
    console.log("Query response: ", body);
    return;
  }
  const { rows } = body.result;

  const progressBar = multibar.create(rows.length, 0, {
    ...Presets.shades_grey,
  });

  for (const row of rows) {
    await cacheLienOp(decode(row));
    progressBar.increment();
  }
  multibar.stop()
}

main()
