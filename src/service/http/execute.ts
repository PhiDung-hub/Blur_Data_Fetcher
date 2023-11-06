import { Router } from "express";
import {
  retrieveMostRecentLienState
} from '../../lib/prisma/retrieve.js';
import { refinanceAuction, startAuction } from "../../lib/mainnet/execute.js";
import { extractLien } from "../../lib/utils/conversion.js";
import { LienStruct } from "../../lib/encode.js";

export const executeRouter = Router();

interface RefinanceBody {
  rate: number,
  lienId: number
}

executeRouter.post('/refinanceAuction', async (req, res) => {
  const { rate, lienId }: RefinanceBody = req.body;

  // Step 1: Validate params
  const currentState = await retrieveMostRecentLienState(lienId);
  if (!currentState) {
    return res.status(400).json({ error: "Invalid lien id" });
  }

  if (currentState.auctionStartBlock === 0) {
    return res.status(400).json({ error: "Lien is not in auction" });
  }

  // Step 2: Try execute, monitor status.
  const currentLien = extractLien(currentState);
  try {
    const txHash = await refinanceAuction({ lien: currentLien, lienId: currentState.lienId, rate });
    return res.json({ tx_hash: txHash, status: 'Success' })
  } catch (err: any) {
    console.error("Cause:", err.cause);
    console.error("Details:", err.details);
    return res.status(400).json({ error: "Execution failed! Transaction reverted" });
  }
});

interface AuctionBody {
  lienId: number
}
executeRouter.post('/startAuction', async (req, res) => {
  const { lienId }: AuctionBody = req.body;

  const currentState = await retrieveMostRecentLienState(lienId);
  if (!currentState) {
    return res.status(400).json({ error: "Invalid lien id" });
  }

  if (currentState.auctionStartBlock === 0) {
    return res.status(400).json({ error: "Lien is not in auction" });
  }

  // Consider check for address?
  // if (currentState.lender !== process.env.OUR_ADDRESS) {
  //   return res.status(400).json({ error: "Not one of our loans" });
  // }

  // Step 2: Try execute, monitor status.
  const currentLien = extractLien(currentState);
  try {
    const txHash = await startAuction({ lien: currentLien, lienId: currentState.lienId });
    return res.json({ tx_hash: txHash, status: 'Success' })
  } catch (err: any) {
    console.error("Cause:", err.cause);
    console.error("Details:", err.details);
    return res.status(400).json({ error: "Execution failed! Transaction reverted" });
  }
})
