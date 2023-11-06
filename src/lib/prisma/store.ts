import {
  PrismaClient,
  LienCreate,
  LienRefinance,
  LienAuction,
  LienDelete,
  LienState,
  EthereumBlock,
} from "@prisma/client";


const prisma = new PrismaClient();

/////////////////// CACHE /////////////////
type Create = Omit<LienCreate, "id">;
type Delete = Omit<LienDelete, "id">;
type Auction = Omit<LienAuction, "id">;
type Refinance = Omit<LienRefinance, "id">;

export type LienOp =
  { payload: Create, schema: 'CREATE' } |
  { payload: Delete, schema: 'DELETE' } |
  { payload: Auction, schema: 'AUCTION' } |
  { payload: Refinance, schema: 'REFINANCE' };

/////
export function cacheLienOp({ payload, schema }: LienOp) {
  switch (schema) {
    case 'CREATE':
      return prisma.lienCreate.upsert({
        create: {
          ...payload
        },
        update: {
          ...payload
        },
        where: {
          lienId: payload.lienId,
        }
      })

    case 'DELETE':
      return prisma.lienDelete.upsert({
        create: {
          ...payload
        },
        update: {
          ...payload
        },
        where: {
          lienId: payload.lienId,
        }
      })

    case 'REFINANCE':
      return prisma.lienRefinance.upsert({
        create: {
          ...payload
        },
        update: {
          ...payload
        },
        where: {
          lienId_block: {
            lienId: payload.lienId,
            block: payload.block,
          }
        }
      })

    case 'AUCTION':
      return prisma.lienAuction.upsert({
        create: {
          ...payload
        },
        update: {
          ...payload
        },
        where: {
          lienId_block: {
            lienId: payload.lienId,
            block: payload.block,
          }
        }
      })
  }
}

export function cacheLienOps(payload: LienOp[]) {
  const upsertOps = payload.map(op => cacheLienOp(op));
  return prisma.$transaction(upsertOps);
}

/////
export type State = Omit<LienState, "id">;
export function cacheLienState(payload: State) {
  const { lienId, block } = payload;

  return prisma.lienState.upsert({
    where: {
      lienId_block: {
        lienId,
        block
      },
    },
    update: {
      ...payload
    },
    create: {
      ...payload
    }
  })
}

export function cacheLienStates(payload: State[]) {
  const upsertOps = payload.map(state => cacheLienState(state));
  return prisma.$transaction(upsertOps);
}


/////
export function cacheBlock({ block, time }: EthereumBlock) {
  return prisma.ethereumBlock.upsert({
    where: {
      block,
    },
    update: {
      block, time
    },
    create: {
      block, time
    }
  })
}

export function cacheBlocks(payload: EthereumBlock[]) {
  const upsertOps = payload.map(block => cacheBlock(block));
  return prisma.$transaction(upsertOps);
}
///////////////// END CACHE ////////////////

//////////////////// CLEANERS //////////////////

// export async function resetLienStates() {
//   await prisma.lienCreate.deleteMany();
//   await prisma.lienDelete.deleteMany();
//   await prisma.lienAuction.deleteMany();
//   await prisma.lienRefinance.deleteMany();
// }
// resetLienStates();

// async function main() {
//   await prisma.lienState.deleteMany();
// }
// main()
