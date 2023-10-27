import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import fs from "fs";
import csv from "fast-csv";

import { PrismaClient } from "@prisma/client";

export function createFolderIfNotExists(folderPath: string) {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
}


const prisma = new PrismaClient();

async function exportToCSV(schema: string) {
  let data!: any;
  let outputFilename!: string;
  switch (schema) {
    case "Auction":
      data = await prisma.lienAuction.findMany();
      outputFilename = "Auction.csv";
      break;
    case "Refinance":
      data = await prisma.lienRefinance.findMany();
      outputFilename = "Refinance.csv";
      break;
    case "Create":
      data = await prisma.lienCreate.findMany();
      outputFilename = "Create.csv";
      break;
    case "Delete":
      data = await prisma.lienDelete.findMany();
      outputFilename = "Delete.csv";
      break;
    case "LienState":
      data = await prisma.lienState.findMany();
      outputFilename = "LienState.csv";
      break;
    default:
      console.info(`Invalid schema name: '${schema}'`);
      return;
  }

  try {
    const csvStream = csv.format({ headers: true });
    const outputFolder = "csv";
    createFolderIfNotExists(outputFolder);
    const writableStream = fs.createWriteStream(
      `${outputFolder}/${outputFilename}`
    );

    csvStream.pipe(writableStream);

    for (const row of data) {
      csvStream.write(row);
    }

    csvStream.end();
    console.log("CSV file generated successfully!");
  } catch (error) {
    console.error("Error exporting to CSV:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const argv = await yargs(hideBin(process.argv))
    .option("schemas", {
      alias: "s",
      description: "Specify one or more schemas to export",
      array: true,
      demandOption: true,
      requiresArg: true,
      string: true,
    })
    .help()
    .alias("help", "h")
    .parse();

  const schemas: string[] = argv.schemas;
  for (const schema of schemas) {
    await exportToCSV(schema);
  }
}
main();

