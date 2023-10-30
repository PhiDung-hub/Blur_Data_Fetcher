import { Headers } from 'node-fetch';
import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

import { cacheBlocks } from '../../lib/prisma/store.js';

import { MultiBar, Presets } from "cli-progress";
import { EthereumBlock } from '@prisma/client';
import { chunkArray } from '../../lib/utils/bisect.js';
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
  number: string; // string number
  time: string; // modified ISO string
}

function decodeDuneQuery(row: ResultRow): EthereumBlock {
  const {number, time} = row;
  const unixSecond = new Date(time).getTime() / 1000;
  return { 
    block: Number(number),
    time: unixSecond,
  }
}

// NOTE: 300K ENTRIES COLLECTED
async function main() {
  //  Call the Dune API
  const queryId = 3155382;
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

  const BATCH_SIZE = 10_000;

  const decodedRows = (rows as ResultRow[]).map((r) => decodeDuneQuery(r));
  const rowChunks = chunkArray(decodedRows, BATCH_SIZE);

  console.log(`\n\`dune_collector/get_blocks.ts\`: Fetching block information from Dune query id: ${queryId}...\n\n`);

  for (const rowChunk of rowChunks) {
    await cacheBlocks(rowChunk);
    progressBar.increment(rowChunk.length);
  }
  multibar.stop();
}

main()
