import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.lienAuction.updateMany({
    data: {
      event_type: "UPDATE"
    }
  })
}

main()
