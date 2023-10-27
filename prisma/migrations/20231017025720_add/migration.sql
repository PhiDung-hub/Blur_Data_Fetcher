-- CreateTable
CREATE TABLE "EventLoanOfferTaken" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "collection" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "auctionDuration" INTEGER NOT NULL,
    "borrower" TEXT NOT NULL,
    "lender" TEXT NOT NULL,
    "loanAmount" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "tokenId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "EventRefinance" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "collection" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL,
    "newAmount" TEXT NOT NULL,
    "newAuctionDuration" INTEGER NOT NULL,
    "newLender" TEXT NOT NULL,
    "newRate" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "EventSeize" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "collection" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Repay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "collection" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);
