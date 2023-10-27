import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { MultiBar, Presets } from "cli-progress";

import { cacheLienState } from "../lib/prisma/stores.js";
import { buildLienState, retrieveAllLiens } from "../lib/prisma/aggregate.js";

const multibar = new MultiBar({
  format: "{bar} {percentage}% | ETA: {eta}s | {value}/{total}",
  hideCursor: false,
  clearOnComplete: false,
});


async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("fromLienId", {
      alias: "from",
      description: "Starting lien Id to process",
      number: true,
      default: 0
    })
    .option("toLienId", {
      alias: "to",
      description: "Final lien Id to process",
      number: true,
      default: 110000
    })
    .help()
    .alias("help", "h")
    .parse();
  const lienIds = await retrieveAllLiens();
  lienIds.sort((a, b) => a - b);

  const lastLienId = lienIds[lienIds.length - 1];
  const from = argv.fromLienId;
  const to = argv.toLienId < lastLienId ? argv.toLienId : lastLienId
  const progressBar = multibar.create(to - from + 1, 0, {
    ...Presets.shades_grey,
  });

  for (const lienId of lienIds) {
    if (lienId < argv.fromLienId || lienId > argv.toLienId) {
      continue; // skip
    }
    const states = await buildLienState(lienId);
    // console.log(states)
    for (const state of states) {
      await cacheLienState(state);
    }
    // const promises = states.map(s => cacheLienState(s))
    // await Promise.all(promises);
    progressBar.increment();
  }

  multibar.stop();
}

main()
