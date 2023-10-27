/*
  Warnings:

  - You are about to alter the column `rate` on the `LienCreate` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `rate` on the `LienRefinance` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LienCreate" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" DATETIME NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "borrower" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);
INSERT INTO "new_LienCreate" ("amount", "auctionDuration", "auctionStartBlock", "block", "borrower", "collection", "event_type", "hash", "id", "lender", "lienId", "rate", "startTime", "time", "tokenId") SELECT "amount", "auctionDuration", "auctionStartBlock", "block", "borrower", "collection", "event_type", "hash", "id", "lender", "lienId", "rate", "startTime", "time", "tokenId" FROM "LienCreate";
DROP TABLE "LienCreate";
ALTER TABLE "new_LienCreate" RENAME TO "LienCreate";
CREATE UNIQUE INDEX "LienCreate_lienId_key" ON "LienCreate"("lienId");
CREATE TABLE "new_LienRefinance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" DATETIME NOT NULL,
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
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
