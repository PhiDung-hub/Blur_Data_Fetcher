/*
  Warnings:

  - You are about to drop the column `timeStamp` on the `EthereumBlock` table. All the data in the column will be lost.
  - Added the required column `time` to the `EthereumBlock` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EthereumBlock" (
    "block" INTEGER NOT NULL,
    "time" INTEGER NOT NULL
);
INSERT INTO "new_EthereumBlock" ("block") SELECT "block" FROM "EthereumBlock";
DROP TABLE "EthereumBlock";
ALTER TABLE "new_EthereumBlock" RENAME TO "EthereumBlock";
CREATE UNIQUE INDEX "EthereumBlock_block_key" ON "EthereumBlock"("block");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
