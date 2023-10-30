import { PrismaClient } from "@prisma/client";

const client = new PrismaClient();

export default async function main() {
  const blocks = await client.ethereumBlock.findMany();

  let previousTimestamp = blocks[0].time;
  for (const block of blocks.slice(1)) {
    const interval = block.time - previousTimestamp;
    if (interval !== 12) {
      console.log("Mismatch at block: ", block);
    }
    previousTimestamp = block.time;
  }
}

main()
