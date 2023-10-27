import { Headers } from 'node-fetch';
import fetch from 'node-fetch';
import dotenv from "dotenv";
dotenv.config(); // Load environment variables from .env file

const DUNE_API_KEY = process.env.DUNE_API_KEY

// Add the API key to an header object
const meta = {
  "x-dune-api-key": DUNE_API_KEY!
};

const header = new Headers(meta);

async function main() {
  //  Call the Dune API
  const queryId = 3141010;
  const response = await fetch(`https://api.dune.com/api/v1/query/${queryId}/results`, {
    method: 'GET',
    headers: header
  });
  const body: any = await response.json();
  if (!body.result) {
    console.log("Empty result for query id -", queryId);
    console.log("Query response: ", body);
    return;
  }
  const { rows } = body.result;

  console.log("\nPreview: ");
  for (const row of rows.slice(0, 2)) {
    console.log(row)
  }
  console.log("\nRESULT SIZE: ", rows.length);
}

main()
