/*
  Warnings:

  - A unique constraint covering the columns `[lienId]` on the table `EventSeize` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lienId]` on the table `LienCreate` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[lienId]` on the table `LienDelete` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventSeize_lienId_key" ON "EventSeize"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "LienCreate_lienId_key" ON "LienCreate"("lienId");

-- CreateIndex
CREATE UNIQUE INDEX "LienDelete_lienId_key" ON "LienDelete"("lienId");
