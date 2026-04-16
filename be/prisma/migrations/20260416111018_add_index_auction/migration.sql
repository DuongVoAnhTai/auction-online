-- CreateIndex
CREATE INDEX "auctions_status_startTime_endTime_idx" ON "auctions"("status", "startTime", "endTime");
