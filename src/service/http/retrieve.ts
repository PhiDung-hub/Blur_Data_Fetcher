import { Router } from "express";
import {
  retrieveActiveAuctions,
  retrieveLienStateByCollection, retrieveLienStateById, retrieveLienStateByIds, retrieveLienStateByLender
} from '../../lib/prisma/retrieve.js';
import { normalizeQueryArray, toNumberIfValidWithLimit } from "../../lib/api/parse.js";
import { getCurrentBlock } from "../../lib/mainnet/core.js";

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
