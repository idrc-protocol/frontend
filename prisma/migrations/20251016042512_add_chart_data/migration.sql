-- CreateTable
CREATE TABLE "ChartData" (
    "id" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "timeframe" TEXT NOT NULL,
    "timestamp" BIGINT NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChartData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ChartData_symbol_timeframe_idx" ON "ChartData"("symbol", "timeframe");

-- CreateIndex
CREATE INDEX "ChartData_updatedAt_idx" ON "ChartData"("updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChartData_symbol_timeframe_timestamp_key" ON "ChartData"("symbol", "timeframe", "timestamp");
