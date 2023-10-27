// Decode raw Blend event data into typescript structs
import { bytes32ToAddress, bytes32ToNumber, bytes32ToBigint } from "./utils/conversion.js";

export type BlendEvent = {
  data: EventLoanOfferTaken,
  type: "LoanOfferTaken"
} | {
  data: EventRepay,
  type: "Repay"
} | {
  data: EventSeize,
  type: "Seize"
} | {
  data: EventStartAuction,
  type: "StartAuction"
} | {
  data: EventRefinance,
  type: "Refinance"
};

// Repay(uint256 lienId, address collection)
export function decodeRepay(rawData: string) {
  const trimmed0x = rawData.slice(2);

  const arg0 = trimmed0x.slice(0, 64);
  const arg1 = trimmed0x.slice(64, 2 * 64)

  return {
    lienId: bytes32ToNumber(arg0)!, // number, very unlikely to overflow
    collection: bytes32ToAddress(arg1), // collection
  }
}
export type EventRepay = ReturnType<typeof decodeRepay>;

// Seize(uint256 lienId, address collection)
export function decodeSeize(rawData: string) {
  const trimmed0x = rawData.slice(2);

  const arg0 = trimmed0x.slice(0, 64);
  const arg1 = trimmed0x.slice(64, 2 * 64)

  return {
    lienId: bytes32ToNumber(arg0)!, // number, very unlikely to overflow
    collection: bytes32ToAddress(arg1), // collection
  }
}
export type EventSeize = ReturnType<typeof decodeSeize>;

// StartAuction(uint256 lienId, address collection)
export function decodeStartAuction(rawData: string) {
  const trimmed0x = rawData.slice(2);

  const arg0 = trimmed0x.slice(0, 64);
  const arg1 = trimmed0x.slice(64, 2 * 64)

  return {
    lienId: bytes32ToNumber(arg0)!, // number, very unlikely to overflow
    collection: bytes32ToAddress(arg1), // collection
  }
}
export type EventStartAuction = ReturnType<typeof decodeStartAuction>;

// event LoanOfferTaken(
//   bytes32 offerHash, -- arg0
//   uint256 lienId, -- arg1
//   address collection, -- arg2
//   address lender, -- arg3
//   address borrower, -- arg4
//   uint256 loanAmount, -- arg5
//   uint256 rate, -- arg6
//   uint256 tokenId, -- arg7
//   uint256 auctionDuration -- arg8
// )
export function decodeLoanOfferTaken(rawData: string) {
  const trimmed0x = rawData.slice(2);

  const _ = trimmed0x.slice(0, 64); // ignore offerHash
  _;

  const arg1 = trimmed0x.slice(64, 2 * 64)
  const arg2 = trimmed0x.slice(2 * 64, 3 * 64)
  const arg3 = trimmed0x.slice(3 * 64, 4 * 64)
  const arg4 = trimmed0x.slice(4 * 64, 5 * 64)
  const arg5 = trimmed0x.slice(5 * 64, 6 * 64)
  const arg6 = trimmed0x.slice(6 * 64, 7 * 64)
  const arg7 = trimmed0x.slice(7 * 64, 8 * 64)
  const arg8 = trimmed0x.slice(8 * 64, 9 * 64)

  return {
    lienId: bytes32ToNumber(arg1)!,
    collection: bytes32ToAddress(arg2),
    lender: bytes32ToAddress(arg3),
    borrower: bytes32ToAddress(arg4),
    loanAmount: bytes32ToBigint(arg5),
    rate: bytes32ToNumber(arg6)!,
    tokenId: bytes32ToNumber(arg7)!,
    auctionDuration: bytes32ToNumber(arg8)!,
  }
}
export type EventLoanOfferTaken = ReturnType<typeof decodeLoanOfferTaken>;

// event Refinance(
//   uint256 lienId, -- arg0
//   address collection, -- arg1
//   address newLender, -- arg2
//   uint256 newAmount, -- arg3
//   uint256 newRate, -- arg4
//   uint256 newAuctionDuration -- arg5
// )
export function decodeRefinance(rawData: string) {
  const trimmed0x = rawData.slice(2);

  const arg0 = trimmed0x.slice(0, 64);
  const arg1 = trimmed0x.slice(64, 2 * 64)
  const arg2 = trimmed0x.slice(2 * 64, 3 * 64)
  const arg3 = trimmed0x.slice(3 * 64, 4 * 64)
  const arg4 = trimmed0x.slice(4 * 64, 5 * 64)
  const arg5 = trimmed0x.slice(5 * 64, 6 * 64)

  return {
    lienId: bytes32ToNumber(arg0)!,
    collection: bytes32ToAddress(arg1),
    lender: bytes32ToAddress(arg2),
    loanAmount: bytes32ToBigint(arg3),
    rate: bytes32ToNumber(arg4)!,
    auctionDuration: bytes32ToNumber(arg5)!,
  }
}
export type EventRefinance = ReturnType<typeof decodeRefinance>;

