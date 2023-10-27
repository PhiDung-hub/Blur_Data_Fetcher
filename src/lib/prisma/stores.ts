import {
  PrismaClient,
  LienCreate,
  LienRefinance,
  LienAuction,
  LienDelete,
  LienState,
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

export async function cacheLienOp({ payload, schema }: LienOp) {
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
          hash: payload.hash,
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
          hash: payload.hash,
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
          hash: payload.hash,
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
          hash: payload.hash,
        }
      })
  }
}

export type State = Omit<LienState, "id">;
export async function cacheLienState(payload: State) {
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
///////////////// END CACHE ////////////////

///////////////// RETRIEVERS ///////////////
//
///////////////// END RETRIEVERS ///////////////

//////////////////// CLEANERS //////////////////

export async function resetLienStates() {
  await prisma.lienCreate.deleteMany();
  await prisma.lienDelete.deleteMany();
  await prisma.lienAuction.deleteMany();
  await prisma.lienRefinance.deleteMany();
}

export async function resetEvents() {
  await prisma.eventSeize.deleteMany();
  await prisma.eventRefinance.deleteMany();
  await prisma.eventStartAuction.deleteMany();
  await prisma.eventLoanOfferTaken.deleteMany();
  await prisma.eventRepay.deleteMany();
}
// resetLienStates();

///////////////// END CLEANERS /////////////////

// async function main() {
//   await prisma.lienState.deleteMany();
// }
// main()
