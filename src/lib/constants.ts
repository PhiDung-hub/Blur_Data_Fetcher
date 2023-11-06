export const BLEND_CONTRACT = "0x29469395eAf6f95920E59F858042f0e28D98a20B"

///////////////////////////////
//////// Blend Events /////////
export const BLEND_EVT_LoanOfferTaken = "event LoanOfferTaken(bytes32 offerHash, uint256 lienId, address collection, address lender, address borrower, uint256 loanAmount, uint256 rate, uint256 tokenId, uint256 auctionDuration)";
export const BLEND_EVT_LoanOfferTaken_SELECTOR = "0x06a333c2d6fe967ca967f7a35be2eb45e8caeb6cf05e16f55d42b91b5fe31255";

export const BLEND_EVT_Repay = "event Repay(uint256 lienId, address collection)";
export const BLEND_EVT_Repay_SELECTOR = "0x2469cc9e12e74c63438d5b1117b318cd3a4cdaf9d659d9eac6d975d14d963254";

export const BLEND_EVT_Seize = "event Seize(uint256 lienId, address collection)";
export const BLEND_EVT_Seize_SELECTOR = "0xb71caf41fe0e019dbe21a1ae3493f11a729c31548ed1e304ae7f6e8c8df275de";

export const BLEND_EVT_StartAuction = "event StartAuction(uint256 lienId, address collection)";
export const BLEND_EVT_StartAuction_SELECTOR = "0xe5095dc360d1a56740c946cccc76520c1a1a57381c950520062adeda68dbf572";

export const BLEND_EVT_Refinance = "event Refinance(uint256 lienId, address collection, address newLender, uint256 newAmount, uint256 newRate, uint256 newAuctionDuration)";
export const BLEND_EVT_Refinance_SELECTOR = "0x558a9295c62e9e1b12a21c8fe816f4816a2e0269a53157edbfa16017b11b9ac9";
////// END Blend Events ///////
///////////////////////////////
//
export const BLUR_GENESIS_BLOCK = 17_165_950;
