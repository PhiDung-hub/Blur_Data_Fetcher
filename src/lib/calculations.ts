// Translation from Blend's `Helpers.sol` - https://github.com/PhiDung-hub/Blur_Clone/blob/main/src/BlurLending/Helpers.sol
import { bipsToSignedWads, signedWadsToBips, wadDiv, wadExp, wadMul } from "./utils/wadMath.js";

const _YEAR_WAD = 365n * 86400n * BigInt(10 ** 18);
const _LIQUIDATION_THRESHOLD = 100_000n; // 1000% APY

/** 
* @param amount Amount in wei
* @param rate lending rate in bips
* @param startTime Unix timestamp in seconds
* @param currentTime Unix timestamp in seconds
*
* @returns Current debt amount wei
**/
export function computeCurrentDebt(amount: bigint, rate: bigint, startTime: bigint, currentTime: bigint) {
  if (currentTime < startTime || currentTime < 0 || startTime < 0) {
    throw new Error("Invalid input");
  }

  const loanTime = currentTime - startTime;
  const yearsWad = wadDiv(loanTime * BigInt(10 ** 18), _YEAR_WAD);

  const interestFactor = wadMul(yearsWad, bipsToSignedWads(rate));

  // Rate is compounded every infinitesimal period.
  // Using the fact that amount is not in in wad -> not require further normalization.
  return wadMul(amount, wadExp(interestFactor));
}

export function computeRefinancingAuctionRate(startBlock: bigint, auctionDuration: bigint, oldRate: bigint, currentBlock: bigint) {
  const currentAuctionBlock = currentBlock - startBlock;
  const oldRateWads = bipsToSignedWads(oldRate);

  const auctionT1 = auctionDuration / 5n;
  const auctionT2 = 4n * auctionDuration / 5n;

  // ending rate after T1.
  let maxRateWads: bigint;
  {
    const aInverse = -bipsToSignedWads(15_000n);
    const b = 2n;
    const maxMinRateWads = bipsToSignedWads(500n);

    // oldRate < 15_000bps or 15% APY.
    if (oldRateWads < -b * aInverse / 2n) {
      maxRateWads = maxMinRateWads + (oldRateWads ** 2n) / aInverse + b * oldRateWads;
    } else {
      maxRateWads = maxMinRateWads - (b ** 2n) * aInverse / 4n;
    }
  }

  const startSlope = maxRateWads / auctionT1;

  const middleSlope = bipsToSignedWads(9_000n) / ((3n * auctionDuration) / 5n) + 1n;
  const middleB = maxRateWads - auctionT1 * middleSlope;

  const endSlope = (bipsToSignedWads(_LIQUIDATION_THRESHOLD) - (auctionT2 * middleSlope + middleB)) / (auctionDuration - auctionT2);
  const endB = bipsToSignedWads(_LIQUIDATION_THRESHOLD) - auctionDuration * endSlope;

  // partition yield curve into 3 lines
  if (currentAuctionBlock < auctionT1) {
    return signedWadsToBips(startSlope * currentAuctionBlock);
  } else if (currentAuctionBlock < auctionT2) {
    return signedWadsToBips(middleSlope * currentAuctionBlock + middleB);
  } else if (currentAuctionBlock < auctionDuration) {
    return signedWadsToBips(endSlope * currentAuctionBlock + endB);
  } else {
    return _LIQUIDATION_THRESHOLD;
  }
}

// function main() {
//   // Lend 1 year at 100% APY 
//   // -> Expect e * initialAmount in debt
//   console.log(computeCurrentDebt(1_000_000n, 10_000n, 0n, 365n * 86400n));
//
//   console.log(computeRefinancingAuctionRate(0n, 9_000n, 0n, 1800n));
//   console.log(computeRefinancingAuctionRate(0n, 9_000n, 0n, 7200n));
//   console.log(computeRefinancingAuctionRate(0n, 9_000n, 0n, 9000n));
//
//   console.log(computeRefinancingAuctionRate(0n, 9_000n, 15100n, 1800n));
//   console.log(computeRefinancingAuctionRate(0n, 9_000n, 15100n, 7200n));
//   console.log(computeRefinancingAuctionRate(0n, 9_000n, 15100n, 9000n));
// }
//
// main();
