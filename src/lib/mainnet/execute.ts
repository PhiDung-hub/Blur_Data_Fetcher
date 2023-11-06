import { TestClient, test_client } from "../../clients/viem.js";
import { BLEND_ABI } from "../abi/Blend.js";
import { BLEND_CONTRACT } from "../constants.js";
import { LienStruct, calculateLienHash } from "../encode.js";

export async function refinanceAuction({ lien, lienId, rate, client = test_client }: { lien: LienStruct, lienId: number, rate: number, client?: TestClient }) {
  await test_client.impersonateAccount({
    address: process.env.IMPERSONATE_ADDRESS! as `0x${string}`
  });
  const { request } = await client.simulateContract({
    address: BLEND_CONTRACT as `0x${string}`,
    abi: BLEND_ABI,
    functionName: "refinanceAuction",
    args: [lien, lienId, rate],
  });

  return client.writeContract(request);
}

export async function startAuction({ lien, lienId, client = test_client }: { lien: LienStruct, lienId: number, client?: TestClient }) {
  const { request } = await client.simulateContract({
    address: BLEND_CONTRACT as `0x${string}`,
    abi: BLEND_ABI,
    functionName: "startAuction",
    args: [lien, lienId],
  });

  return client.writeContract(request);
}

export async function checkLienHash({ expectedLien, lienId, client = test_client }: { expectedLien: LienStruct, lienId: number, client?: TestClient }) {
  const executionParams = {
    address: BLEND_CONTRACT as `0x${string}`,
    abi: BLEND_ABI,
    functionName: "liens",
    args: [lienId],
  }

  const actual = await client.readContract(executionParams);
  console.log("Actual lien hash:\n", actual);

  const expected = calculateLienHash(expectedLien);
  console.log("Expected lien hash:\n", expected);
}

// async function main() {
//   await test_client.impersonateAccount({
//     address: process.env.IMPERSONATE_ADDRESS! as `0x${string}`
//   });
//
//   const originalLien: LienStruct = {
//     lender: "0xfD1CB5F8590e40450eb83F3E25e21B24175b140E",
//     borrower: "0x7Df70b612040c682d1cb2e32017446e230FcD747",
//     collection: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
//     tokenId: 6371n,
//     amount: 4335522362679578673n,
//     startTime: 1697947739n,
//     rate: 0n,
//     auctionStartBlock: 18410547n,
//     auctionDuration: 9000n
//   }
//
//   await checkLienHash({ expectedLien: originalLien, lienId: 104759, client: test_client });
//
//   console.log("\nRefinancing lien 104759 @ block 18410848 ....");
//
//   const tx = await refinanceAuction({ lien: originalLien, lienId: 104759, rate: 0, client: test_client });
//   console.log("\nTransaction hash: ", tx);
//
//   const b0 = await test_client.getBlock();
//   console.log({ timestamp: b0.timestamp, number: b0.number });
//
//   const refinancedLien: LienStruct = {
//     ...originalLien,
//     lender: "0xCBB0Fe555F61D23427740984325b4583A4A34C82",
//     startTime: b0.timestamp,
//     auctionStartBlock: 0n,
//   }
//   await checkLienHash({ expectedLien: refinancedLien, lienId: 104759, client: test_client });
//
//   console.log("\nStarting auction on lien 104759 @ block 18410849 ....");
//   const tx_ = await startAuction({ lien: refinancedLien, lienId: 104759, client: test_client });
//   console.log("\nTransaction hash: ", tx_);
//
//   const b = await test_client.getBlock();
//   console.log({ timestamp: b.timestamp, number: b.number });
//
//   const auctionedLien: LienStruct = {
//     ...refinancedLien,
//     auctionStartBlock: 18410849n,
//   }
//
//   await checkLienHash({ expectedLien: auctionedLien, lienId: 104759, client: test_client });
// }
//
// main()
