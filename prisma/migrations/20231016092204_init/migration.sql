-- CreateTable
CREATE TABLE "EventStartAuction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "time" DATETIME NOT NULL,
    "collection" TEXT NOT NULL,
    "tx_hash" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);
