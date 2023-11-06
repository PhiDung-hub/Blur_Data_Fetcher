import { encodeAbiParameters, keccak256 } from "viem";

// struct Lien {
//   address lender;
//   address borrower;
//   ERC721 collection;
//   uint256 tokenId;
//   uint256 amount;
//   uint256 startTime;
//   uint256 rate;
//   uint256 auctionStartBlock;
//   uint256 auctionDuration;
// }
export interface LienStruct {
  lender: `0x${string}`,
  borrower: `0x${string}`,
  collection: `0x${string}`,
  tokenId: bigint,
  amount: bigint,
  startTime: bigint,
  rate: bigint,
  auctionStartBlock: bigint,
  auctionDuration: bigint,
}

export function abiEncodeLien(lien: LienStruct) {
  return encodeAbiParameters(
    [
      { name: "lender", type: "address" }, { name: "borrower", type: "address" }, { name: "collection", type: "address" },
      { name: "tokenId", type: "uint256" }, { name: "amount", type: "uint256" }, { name: "startTime", type: "uint256" },
      { name: "rate", type: "uint256" }, { name: "auctionStartBlock", type: "uint256" }, { name: "auctionDuration", type: "uint256" }
    ],
    [
      lien.lender, lien.borrower, lien.collection,
      lien.tokenId, lien.amount, lien.startTime,
      lien.rate, lien.auctionStartBlock, lien.auctionDuration
    ]
  )
}

export function calculateLienHash(lien: LienStruct) {
  return keccak256(abiEncodeLien(lien));
}

// function main() {
//   let lien: LienStruct = {
//     lender: "0xCBB0Fe555F61D23427740984325b4583A4A34C82",
//     borrower: "0x7Df70b612040c682d1cb2e32017446e230FcD747",
//     collection: "0xBd3531dA5CF5857e7CfAA92426877b022e612cf8",
//     tokenId: 6371n,
//     amount: 4335522362679578673n,
//     startTime: 1698038303n,
//     rate: 0n,
//     auctionStartBlock: 0n,
//     auctionDuration: 9000n
//   }
//
//   // EXPECT 0x28fdd56bb8126d8b80031d99504dc0ec8c13380e837c3fce8277faad8b39c7d2
//   console.log(keccak256(abiEncodeLien(lien)));
// }
// main()
