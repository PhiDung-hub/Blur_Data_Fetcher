import { Router } from "express";
import {
  retrieveActiveAuctions,
  retrieveLienStateByCollection, retrieveLienStateById, retrieveLienStateByIds, retrieveLienStateByLender, retrieveMostRecentLienState
} from '../../lib/prisma/retrieve.js';
import { normalizeQueryArray, toNumberIfValidWithLimit } from "../../lib/api/parse.js";
import { getCurrentBlock } from "../../lib/mainnet/core.js";
import { computeCurrentDebt, computeRefinancingAuctionRate } from "../../lib/calculations.js";

export const lienRouter = Router();

lienRouter.get('/:lienId', async (req, res) => {
  const { lienId } = req.params;

  if (isNaN(Number(lienId))) {
    return res.status(400).json({ error: `Invalid lienId ${lienId}` });
  }

  try {
    const states = await retrieveLienStateById(Number(lienId));
    return res.json({ data: states, status: `Success` });
  } catch (error) {
    return res.status(500).json({ error: `An error occurred while retrieving lien ${lienId}` });
  }
});

lienRouter.get('/:lienId/currentDebt', async (req, res) => {
  const { lienId } = req.params;

  if (isNaN(Number(lienId))) {
    return res.status(400).json({ error: `Invalid input ${lienId}` });
  }

  try {
    const lastState = await retrieveMostRecentLienState(Number(lienId));
    if (lastState === null) {
      return res.status(400).json({ error: `Invalid lienId ${lienId}` });
    }
    if (lastState.startTime == 0) {
      return res.status(400).json({ error: `Lien ${lienId} is deleted` });
    }

    const block = await getCurrentBlock();
    const currentDebt = computeCurrentDebt(
      BigInt(lastState.amount),
      BigInt(lastState.rate),
      BigInt(lastState.startTime),
      block.timestamp
    );
    return res.json({ data: { debtAmount: currentDebt.toString(), block: Number(block.number) }, status: `Success` });
  } catch (e) {
    return res.status(500).json({ error: `An error occurred while retrieving lien ${lienId}` });
  }
});

lienRouter.get('/:lienId/currentAuctionRate', async (req, res) => {
  const { lienId } = req.params;

  if (isNaN(Number(lienId))) {
    return res.status(400).json({ error: `Invalid input ${lienId}` });
  }

  try {
    const lastState = await retrieveMostRecentLienState(Number(lienId));
    if (lastState === null) {
      return res.status(400).json({ error: `Invalid lienId ${lienId}` });
    }
    if (lastState.startTime == 0) {
      return res.status(400).json({ error: `Lien ${lienId} is deleted` });
    }
    if (lastState.auctionStartBlock == 0) {
      return res.status(400).json({ error: `Lien ${lienId} is is not in active auction` });
    }

    const block = await getCurrentBlock();
    const auctionRate = computeRefinancingAuctionRate(
      BigInt(lastState.auctionStartBlock),
      BigInt(lastState.auctionDuration),
      BigInt(lastState.rate),
      block.number
    );
    return res.json({ data: { currentAuctionRate: Number(auctionRate), block: Number(block.number) }, status: `Success` });
  } catch (error) {
    return res.status(500).json({ error: `An error occurred while retrieving lien ${lienId}` });
  }
});


lienRouter.get('/', async (req, res) => {
  const paramLienId = req.query.id;
  if (!paramLienId) {
    return res.status(400).json({ error: `Invalid liens` });
  }

  // "lienId" may be a single value or an array of values depending on the query
  const lienIds = normalizeQueryArray({ param: paramLienId, convert: toNumberIfValidWithLimit(100) });

  try {
    const states = await retrieveLienStateByIds(lienIds);
    return res.json({ data: states, status: `Success` });
  } catch (error) {
    return res.status(500).json({ error: 'An error occurred while retrieving lien states' });
  }
});


export const collectionRouter = Router();

collectionRouter.get('/:collection', async (req, res) => {
  const { collection } = req.params;

  try {
    const states = await retrieveLienStateByCollection(collection);
    return res.json({ data: states, status: `Success` })
  } catch (error) {
    return res.status(500).json({ error: `An error occurred while retrieving liens in collection ${collection}` });
  }
});


export const lenderRouter = Router();

lenderRouter.get('/:lender', async (req, res) => {
  const { lender } = req.params;

  try {
    const states = await retrieveLienStateByLender(lender);
    return res.json({ data: states, status: `Success` })
  } catch (error) {
    return res.status(500).json({ error: `An error occurred while retrieving liens in collection ${lender}` });
  }
});

export const auctionRouter = Router();

auctionRouter.get('/', async (_, res) => {
  try {
    const activeAuctions = await retrieveActiveAuctions();
    const { number } = await getCurrentBlock();
    const nonExpiredAuctions = activeAuctions.filter(a => a.auctionStartBlock + a.auctionDuration > number);
    return res.json({ data: nonExpiredAuctions, status: `Success` })
  } catch (error) {
    return res.status(500).json({ error: `An error occurred while retrieving active auctions` });
  }
});
