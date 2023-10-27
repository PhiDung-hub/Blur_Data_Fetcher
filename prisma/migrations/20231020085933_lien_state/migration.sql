-- CreateTable
CREATE TABLE "LienCreate" (
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
    "rate" TEXT NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "startTime" INTEGER NOT NULL,
    "auctionStartBlock" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "LienDelete" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "hash" TEXT NOT NULL,
    "block" INTEGER NOT NULL,
    "time" DATETIME NOT NULL,
    "event_type" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "collection" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "LienCreate_lienId_collection_key" ON "LienCreate"("lienId", "collection");
