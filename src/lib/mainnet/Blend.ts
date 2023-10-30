import { Log, parseAbi } from "viem";

import { mainnet_client } from "../../clients/viem.js";
import {
  BLEND_CONTRACT, BLEND_EVT_LoanOfferTaken, BLEND_EVT_Refinance,
  BLEND_EVT_Repay, BLEND_EVT_Seize, BLEND_EVT_StartAuction
} from "../constants.js";
import { createMultiBar, createProgressBar } from "../utils/progress.js";
import { decodeLog } from "../decode.js";
import { groupLogsIntoTransactions, resolveTransaction } from "../resolver.js";
import { cacheBlocks, cacheLienOp, cacheLienOps } from "../prisma/store.js";
import { chunkArray } from "../utils/bisect.js";
import { getBlockTimestamp } from "../mainnet/core.js";
import { State as LienState, cacheLienStates } from "../prisma/store.js";
import { constructLien } from "./aggregate.js";
import { retrieveLienIds, retrieveLienOpsFromIds } from "../prisma/retrieve.js";
import { retryWrapper } from "../utils/async.js";


export async function getLienOps({ fromBlock = 17_165_950n, toBlock = undefined }: { fromBlock: bigint, toBlock?: bigint }) {
  return mainnet_client.getLogs({
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
}

export async function collectLienOps({ fromBlock, toBlock, BATCH_SIZE = 1000 }: { fromBlock: number, toBlock: number, BATCH_SIZE?: number }) {
  const multibar = createMultiBar();
  const progressBar = createProgressBar(multibar, toBlock - fromBlock + 1);

  let trunkStart = fromBlock;
  const computeTrunkEnd = (trunkStart: number) => {
    return trunkStart + BATCH_SIZE > toBlock ? toBlock : trunkStart + BATCH_SIZE - 1;
  }

  while (trunkStart < toBlock) {
    const trunkEnd = computeTrunkEnd(trunkStart);
    const rawLogs: Log[] = await retryWrapper({
      fn: async () => {
        return getLienOps({ fromBlock: BigInt(trunkStart), toBlock: BigInt(trunkEnd) });
      },
      fnIdentifier: "`collectBlocks.getBlockTimestamp`"
    });
    const decodedLogs = rawLogs.map((log) => decodeLog(log));
    const transactions = await groupLogsIntoTransactions(decodedLogs);
    const lienOps = transactions.flatMap(tx => resolveTransaction(tx));

    await cacheLienOps(lienOps);

    progressBar.increment(trunkEnd - trunkStart + 1);

    trunkStart += BATCH_SIZE;
  }

  multibar.stop();
}


export async function collectBlocks({ fromBlock, toBlock, BATCH_SIZE = 50 }: { fromBlock: number, toBlock: number, BATCH_SIZE?: number }) {
  const multibar = createMultiBar();
  const progressBar = createProgressBar(multibar, toBlock - fromBlock + 1);

  const blocks = [...Array(toBlock - fromBlock + 1).keys()].map(val => val + fromBlock);
  const blockChunks = chunkArray(blocks, BATCH_SIZE);

  async function getBlockWrapper(block: number) {
    const tryGetBlockTimestamp: Promise<number> = retryWrapper({
      fn: async () => {
        return getBlockTimestamp(block);
      },
      fnIdentifier: "`collectBlocks.getBlockTimestamp`"
    });
    const time = Number(await tryGetBlockTimestamp);
    return {
      block,
      time
    }
  }

  for (const blockChunk of blockChunks) {
    const promises: Promise<{ block: number, time: number }>[] = [];
    blockChunk.forEach(block => {
      promises.push(getBlockWrapper(block));
    });

    const blocks = await Promise.all(promises);
    await cacheBlocks(blocks);
    progressBar.increment(blockChunk.length);
  }

  multibar.stop();
}

export async function constructLienStates({ fromLienId, toLienId = 10_000_000_000, BATCH_SIZE = 10_000 }: { fromLienId: number, toLienId?: number, BATCH_SIZE?: number }) {
  let lienIds = await retrieveLienIds();
  lienIds = lienIds.filter((lienId) => lienId >= fromLienId && lienId <= toLienId);
  lienIds.sort((a, b) => a - b);

  const multibar = createMultiBar();
  const progressBar = createProgressBar(multibar, lienIds.length);
  const idChunks = chunkArray(lienIds, BATCH_SIZE);

  for (const idChunk of idChunks) {
    const idToLienOpsMap = await retrieveLienOpsFromIds(idChunk);
    const allStates: LienState[] = [];

    for (const [_, lienOps] of Object.entries(idToLienOpsMap)) {
      const states = constructLien(lienOps);
      allStates.push(...states);
    }

    await cacheLienStates(allStates);
    progressBar.increment(Object.keys(idToLienOpsMap).length);
  }

  multibar.stop();
}
