/*
  Warnings:

  - You are about to drop the `EventLoanOfferTaken` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRefinance` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventRepay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventSeize` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventStartAuction` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[lienId,block]` on the table `LienAuction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lienId,block]` on the table `LienRefinance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LienAuction_hash_key";

-- DropIndex
DROP INDEX "LienCreate_hash_key";

-- DropIndex
DROP INDEX "LienDelete_hash_key";

-- DropIndex
DROP INDEX "LienRefinance_hash_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventLoanOfferTaken";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventRefinance";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventRepay";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventSeize";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "EventStartAuction";
PRAGMA foreign_keys=on;

-- CreateIndex
CREATE UNIQUE INDEX "LienAuction_lienId_block_key" ON "LienAuction"("lienId", "block");

-- CreateIndex
CREATE UNIQUE INDEX "LienRefinance_lienId_block_key" ON "LienRefinance"("lienId", "block");
