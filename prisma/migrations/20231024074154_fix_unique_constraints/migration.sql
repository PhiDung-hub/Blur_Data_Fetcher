/*
  Warnings:

  - A unique constraint covering the columns `[hash]` on the table `LienAuction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `LienCreate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `LienDelete` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[hash]` on the table `LienRefinance` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LienAuction_lienId_key";

-- DropIndex
DROP INDEX "LienRefinance_lienId_key";

-- CreateIndex
CREATE UNIQUE INDEX "LienAuction_hash_key" ON "LienAuction"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "LienCreate_hash_key" ON "LienCreate"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "LienDelete_hash_key" ON "LienDelete"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "LienRefinance_hash_key" ON "LienRefinance"("hash");
