import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import { constructLienStates } from "../lib/mainnet/Blend.js";


export default async function main() {
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
      default: 1_000_000_000
    })
    .help()
    .alias("help", "h")
    .parse();
  const { fromLienId, toLienId } = argv;

  console.log("\n`construct_lien_states.ts`: Constructing lien states from existing lien operations data...\n\n");
  await constructLienStates({ fromLienId, toLienId })
}

main()
