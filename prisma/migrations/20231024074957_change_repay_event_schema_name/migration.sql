/*
  Warnings:

  - You are about to drop the `Repay` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Repay";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "EventRepay" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "tx_hash" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "collection" TEXT NOT NULL,
    "lienId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EventRepay_lienId_key" ON "EventRepay"("lienId");
