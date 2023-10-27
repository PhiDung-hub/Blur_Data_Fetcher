import { PrismaClient } from "@prisma/client";
import { State as LienState } from "./stores.js";

const prisma = new PrismaClient();

export async function buildLienState(lienId: number): Promise<LienState[]> {
  const filter = {
    where: { lienId },
  }
  const lienCreate = await prisma.lienCreate.findMany(filter);

  const lienAuction = await prisma.lienAuction.findMany(filter);

  const lienRefinance = await prisma.lienRefinance.findMany(filter);

  const lienDelete = await prisma.lienDelete.findMany(filter);

  // @ts-ignore
  const lienOps = lienCreate.concat(lienAuction, lienRefinance, lienDelete).map((entry) => {
    const { id, hash, ...rest } = entry;
    return rest
  })

  lienOps.sort((s1, s2) => s1.block - s2.block)

  if (lienOps.length == 0) {
    return [];
  }

  const createOp = lienOps[0];
  if (createOp.event_type !== 'CREATE') {
    throw new Error('Invalid lien Data, CREATE must appear first');
  }

  const invariances = { lienId: createOp.lienId, tokenId: createOp.tokenId, borrower: createOp.borrower, collection: createOp.collection };

  let { amount, rate, lender, startTime, auctionDuration, auctionStartBlock } = createOp;

  const states: LienState[] = lienOps.map((op) => {
    // coalesce values with last values
    amount = op.amount ?? amount;
    rate = op.rate ?? rate;
    lender = op.lender ?? lender;
    auctionDuration = op.auctionDuration ?? auctionDuration;
    auctionStartBlock = op.auctionStartBlock ?? auctionStartBlock;
    startTime = op.startTime ?? startTime;

    const activeData = {
      block: op.block,
      time: op.time,
      ...invariances,
      lender,

      amount: amount,
      rate,
      startTime,
      auctionDuration,
      auctionStartBlock
    }

    switch (op.event_type) {
      case 'CREATE':
      case 'UPDATE':
        return activeData

      // lien is deleted
      default:
        return {
          // book keepings
          block: op.block,
          time: op.time,
          ...invariances,
          lender,
          // nullified data
          amount: "0",
          rate: 0,
          startTime: 0,
          auctionDuration: 0,
          auctionStartBlock: 0
        }
    }
  });

  return states;
}

export async function retrieveAllLiens(): Promise<number[]> {
  const lienIds = prisma.lienCreate.findMany({
    select: {
      lienId: true
    }
  }).then(r => r.map(({ lienId }) => lienId))

  return lienIds;
}

