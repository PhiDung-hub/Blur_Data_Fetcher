import { retrieveLienIds } from "../../lib/prisma/retrieve.js";

async function main() {
  const lienIds = await retrieveLienIds();

  let start = 0;
  lienIds.forEach((lienId, id) => {
    if (id !== lienId) {
      if (start == 0) {
        start = lienId;
      }
      console.log("Mismatch at ", lienId);
    }
  })
  console.log("Start: ", start);
}

main();
