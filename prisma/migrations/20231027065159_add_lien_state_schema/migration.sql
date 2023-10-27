-- CreateTable
CREATE TABLE "LienState" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lienId" INTEGER NOT NULL,
    "block" INTEGER NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "borrower" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "tokenId" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LienState_lienId_key" ON "LienState"("lienId");
