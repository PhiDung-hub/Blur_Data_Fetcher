/*
  Warnings:

  - A unique constraint covering the columns `[lienId]` on the table `EventLoanOfferTaken` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lienId]` on the table `EventRefinance` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lienId]` on the table `EventStartAuction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lienId]` on the table `Repay` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LienCreate_lienId_collection_key";

-- CreateTable
CREATE TABLE "LienRefinance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" DATETIME NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "rate" TEXT NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "LienAuction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" DATETIME NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LienRefinance_lienId_key" ON "LienRefinance"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "LienAuction_lienId_key" ON "LienAuction"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "EventLoanOfferTaken_lienId_key" ON "EventLoanOfferTaken"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "EventRefinance_lienId_key" ON "EventRefinance"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "EventStartAuction_lienId_key" ON "EventStartAuction"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "Repay_lienId_key" ON "Repay"("lienId");
