-- CreateTable
CREATE TABLE "PriceFeed" (
    "id" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "date" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PriceFeed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PriceFeed_base_target_idx" ON "PriceFeed"("base", "target");

-- CreateIndex
CREATE INDEX "PriceFeed_updatedAt_idx" ON "PriceFeed"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "PriceFeed_base_target_key" ON "PriceFeed"("base", "target");
