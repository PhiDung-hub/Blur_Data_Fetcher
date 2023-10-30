import {
  LienAuction,
  LienCreate,
  LienDelete,
  LienRefinance,
  LienState,
  PrismaClient,
} from "@prisma/client";

const prisma = new PrismaClient();

export async function retrieveLienIds(): Promise<number[]> {
  const lienIds = prisma.lienCreate.findMany({
    select: {
      lienId: true
    }
  }).then(r => r.map(({ lienId }) => lienId))

  return lienIds
}

export async function retrieveLastLienId(): Promise<number> {
  const lastLien = await prisma.lienCreate.findFirst({
    orderBy: {
      lienId: 'desc'
    }
  });

  return lastLien!.lienId
}

export function retrieveBlock(num: number) {
  return prisma.ethereumBlock.findUnique({
    where: {
      block: num
    }
  })
}

export function retrieveBlocks(nums: number[]) {
  return prisma.ethereumBlock.findMany({
    where: {
      block: {
        in: nums
      }
    }
  })
}

export function retrieveLastBlock() {
  return prisma.ethereumBlock.findFirst({
    orderBy: {
      block: 'desc'
    }
  })
}

export async function estimateLastComputedBlock() {
  const lastId = await retrieveLastLienId();
  const ops = await retrieveLienOpsFromId(lastId);
  const lastBlock = ops[ops.length - 1].block;

  return lastBlock
}

export type CompositeOp = {
  block: number,
  time: string,
  event_type: 'CREATE' | 'UPDATE' | 'DELETE',
  lienId: number,
  collection: string,
  lender?: string,
  borrower?: string,
  tokenId?: number
  amount?: string,
  rate?: number,
  auctionDuration?: number,
  startTime?: number,
  auctionStartBlock?: number
};

export async function retrieveLienOpsFromId(lienId: number) {
  const filter = {
    where: { lienId },
  }

  const queries = [
    prisma.lienCreate.findMany(filter),
    prisma.lienAuction.findMany(filter),
    prisma.lienRefinance.findMany(filter),
    prisma.lienDelete.findMany(filter),
  ];

  const allOps = await prisma.$transaction(queries);
  const lienCreates = allOps[0] as LienCreate[];
  const lienAuctions = allOps[1] as LienAuction[];
  const lienRefinances = allOps[2] as LienRefinance[];
  const lienDeletes = allOps[3] as LienDelete[];

  const lienOps = [...lienCreates, ...lienAuctions, ...lienRefinances, ...lienDeletes].map((entry) => {
    const { id, hash, ...rest } = entry;
    return rest
  }) as CompositeOp[]

  lienOps.sort((s1, s2) => s1.block - s2.block)

  return lienOps
}

export async function retrieveLienOpsFromIds(lienIds: number[]) {
  const filter = {
    where: {
      lienId: {
        in: lienIds
      }
    },
  }

  const queries = [
    prisma.lienCreate.findMany(filter),
    prisma.lienAuction.findMany(filter),
    prisma.lienRefinance.findMany(filter),
    prisma.lienDelete.findMany(filter),
  ];

  const allOps = await prisma.$transaction(queries);
  const lienCreates = allOps[0] as LienCreate[];
  const lienAuctions = allOps[1] as LienAuction[];
  const lienRefinances = allOps[2] as LienRefinance[];
  const lienDeletes = allOps[3] as LienDelete[];

  const lienOps = [...lienCreates, ...lienAuctions, ...lienRefinances, ...lienDeletes].map((entry) => {
    const { id, hash, ...rest } = entry;
    return rest
  }) as CompositeOp[];

  lienOps.sort((s1, s2) => s1.block - s2.block);

  let opIdMap: { [key: number]: CompositeOp[] } = {};
  for (const lienOp of lienOps) {
    const { lienId } = lienOp;
    if (!opIdMap[lienId]) {
      opIdMap[lienId] = [];
    }
    opIdMap[lienId].push(lienOp);
  }

  return opIdMap
}

export function retrieveMostRecentLienState(lienId: number) {
  return prisma.lienState.findFirst({
    where: {
      lienId,
    },
    orderBy: {
      block: 'desc'
    }
  })
}

export async function retrieveMostRecentLiensState(lienIds: number[]) {
  const queries = lienIds.map((lienId) => retrieveMostRecentLienState(lienId));
  const states = await prisma.$transaction(queries);
  let statesMap: { [key: number]: LienState | null } = {};
  states.forEach((state, idx) => {
    statesMap[lienIds[idx]] = state;
  });

  return statesMap
}
