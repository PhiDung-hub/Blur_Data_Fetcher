/*
  Warnings:

  - A unique constraint covering the columns `[lienId,block]` on the table `LienState` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "LienState_lienId_key";

-- CreateIndex
CREATE UNIQUE INDEX "LienState_lienId_block_key" ON "LienState"("lienId", "block");
