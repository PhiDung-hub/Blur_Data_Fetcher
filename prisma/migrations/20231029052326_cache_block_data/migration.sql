-- CreateTable
CREATE TABLE "EthereumBlock" (
    "block" INTEGER NOT NULL,
    "timeStamp" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EthereumBlock_block_key" ON "EthereumBlock"("block");
