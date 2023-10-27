-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Repay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tx_hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);
INSERT INTO "new_Repay" ("collection", "id", "lienId", "time", "tx_hash") SELECT "collection", "id", "lienId", "time", "tx_hash" FROM "Repay";
DROP TABLE "Repay";
ALTER TABLE "new_Repay" RENAME TO "Repay";
CREATE UNIQUE INDEX "Repay_lienId_key" ON "Repay"("lienId");
CREATE TABLE "new_EventSeize" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tx_hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);
INSERT INTO "new_EventSeize" ("collection", "id", "lienId", "time", "tx_hash") SELECT "collection", "id", "lienId", "time", "tx_hash" FROM "EventSeize";
DROP TABLE "EventSeize";
ALTER TABLE "new_EventSeize" RENAME TO "EventSeize";
CREATE UNIQUE INDEX "EventSeize_lienId_key" ON "EventSeize"("lienId");
CREATE TABLE "new_EventStartAuction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tx_hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);
INSERT INTO "new_EventStartAuction" ("collection", "id", "lienId", "time", "tx_hash") SELECT "collection", "id", "lienId", "time", "tx_hash" FROM "EventStartAuction";
DROP TABLE "EventStartAuction";
ALTER TABLE "new_EventStartAuction" RENAME TO "EventStartAuction";
CREATE UNIQUE INDEX "EventStartAuction_lienId_key" ON "EventStartAuction"("lienId");
CREATE TABLE "new_LienRefinance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);
INSERT INTO "new_LienRefinance" ("amount", "auctionDuration", "auctionStartBlock", "block", "collection", "event_type", "hash", "id", "lender", "lienId", "rate", "startTime", "time") SELECT "amount", "auctionDuration", "auctionStartBlock", "block", "collection", "event_type", "hash", "id", "lender", "lienId", "rate", "startTime", "time" FROM "LienRefinance";
DROP TABLE "LienRefinance";
ALTER TABLE "new_LienRefinance" RENAME TO "LienRefinance";
CREATE UNIQUE INDEX "LienRefinance_lienId_key" ON "LienRefinance"("lienId");
CREATE TABLE "new_LienDelete" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL
);
INSERT INTO "new_LienDelete" ("block", "collection", "event_type", "hash", "id", "lienId", "time") SELECT "block", "collection", "event_type", "hash", "id", "lienId", "time" FROM "LienDelete";
DROP TABLE "LienDelete";
ALTER TABLE "new_LienDelete" RENAME TO "LienDelete";
CREATE UNIQUE INDEX "LienDelete_lienId_key" ON "LienDelete"("lienId");
CREATE TABLE "new_EventRefinance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tx_hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "newAmount" TEXT NOT NULL,
    "newAuctionDuration" INTEGER NOT NULL,
    "newLender" TEXT NOT NULL,
    "newRate" INTEGER NOT NULL
);
INSERT INTO "new_EventRefinance" ("collection", "id", "lienId", "newAmount", "newAuctionDuration", "newLender", "newRate", "time", "tx_hash") SELECT "collection", "id", "lienId", "newAmount", "newAuctionDuration", "newLender", "newRate", "time", "tx_hash" FROM "EventRefinance";
DROP TABLE "EventRefinance";
ALTER TABLE "new_EventRefinance" RENAME TO "EventRefinance";
CREATE UNIQUE INDEX "EventRefinance_lienId_key" ON "EventRefinance"("lienId");
CREATE TABLE "new_EventLoanOfferTaken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tx_hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "borrower" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "loanAmount" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL
);
INSERT INTO "new_EventLoanOfferTaken" ("auctionDuration", "borrower", "collection", "id", "lender", "lienId", "loanAmount", "rate", "time", "tokenId", "tx_hash") SELECT "auctionDuration", "borrower", "collection", "id", "lender", "lienId", "loanAmount", "rate", "time", "tokenId", "tx_hash" FROM "EventLoanOfferTaken";
DROP TABLE "EventLoanOfferTaken";
ALTER TABLE "new_EventLoanOfferTaken" RENAME TO "EventLoanOfferTaken";
CREATE UNIQUE INDEX "EventLoanOfferTaken_lienId_key" ON "EventLoanOfferTaken"("lienId");
CREATE TABLE "new_LienAuction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);
INSERT INTO "new_LienAuction" ("auctionStartBlock", "block", "collection", "event_type", "hash", "id", "lienId", "time") SELECT "auctionStartBlock", "block", "collection", "event_type", "hash", "id", "lienId", "time" FROM "LienAuction";
DROP TABLE "LienAuction";
ALTER TABLE "new_LienAuction" RENAME TO "LienAuction";
CREATE UNIQUE INDEX "LienAuction_lienId_key" ON "LienAuction"("lienId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
