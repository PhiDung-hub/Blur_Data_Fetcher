import { retrieveLienIds } from "../../lib/prisma/retrieve.js";

async function main() {
  const lienIds = await retrieveLienIds();

  lienIds.forEach((lienId, id) => {
    if (id !== lienId) {
      console.log("Mismatch at ", lienId);
    }
  })
}

main();
