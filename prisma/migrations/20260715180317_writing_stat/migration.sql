-- CreateTable
CREATE TABLE "writing_stats" (
    "id" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "date" DATE NOT NULL,
    "wordsAdded" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "writing_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "writing_stats_userId_date_key" ON "writing_stats"("userId", "date");

-- AddForeignKey
ALTER TABLE "writing_stats" ADD CONSTRAINT "writing_stats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
