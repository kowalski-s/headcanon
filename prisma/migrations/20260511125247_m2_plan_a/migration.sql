-- CreateEnum
CREATE TYPE "Tone" AS ENUM ('SLOW_BURN', 'SPICY', 'FLUFF', 'ANGST');

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "templateId" TEXT,
ADD COLUMN     "templateVersion" INTEGER,
ALTER COLUMN "text" SET DEFAULT '';

-- CreateTable
CREATE TABLE "CreateDraft" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fandomId" UUID,
    "shipId" TEXT,
    "tropes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "setting" TEXT,
    "tone" "Tone",
    "step" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreateDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Paragraph" (
    "id" UUID NOT NULL,
    "chapterId" UUID NOT NULL,
    "ordinal" DECIMAL(20,10) NOT NULL,
    "text" TEXT NOT NULL,
    "regensCount" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Paragraph_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyUsage" (
    "userId" UUID NOT NULL,
    "day" DATE NOT NULL,
    "stories" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DailyUsage_pkey" PRIMARY KEY ("userId","day")
);

-- CreateTable
CREATE TABLE "ChapterUsage" (
    "chapterId" UUID NOT NULL,
    "regens" INTEGER NOT NULL DEFAULT 0,
    "continues" INTEGER NOT NULL DEFAULT 0,
    "promptTweaks" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChapterUsage_pkey" PRIMARY KEY ("chapterId")
);

-- CreateTable
CREATE TABLE "LlmCallLog" (
    "id" UUID NOT NULL,
    "callType" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "templateVersion" INTEGER NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "costUsd" DECIMAL(10,6) NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "storyId" UUID,
    "chapterId" UUID,
    "userId" UUID,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LlmCallLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSuggestion" (
    "scope" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiSuggestion_pkey" PRIMARY KEY ("scope","keyHash")
);

-- CreateIndex
CREATE INDEX "CreateDraft_userId_updatedAt_idx" ON "CreateDraft"("userId", "updatedAt");

-- CreateIndex
CREATE INDEX "Paragraph_chapterId_idx" ON "Paragraph"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "Paragraph_chapterId_ordinal_key" ON "Paragraph"("chapterId", "ordinal");

-- CreateIndex
CREATE INDEX "LlmCallLog_callType_createdAt_idx" ON "LlmCallLog"("callType", "createdAt");

-- CreateIndex
CREATE INDEX "LlmCallLog_userId_createdAt_idx" ON "LlmCallLog"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "AiSuggestion_expiresAt_idx" ON "AiSuggestion"("expiresAt");

-- AddForeignKey
ALTER TABLE "CreateDraft" ADD CONSTRAINT "CreateDraft_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Paragraph" ADD CONSTRAINT "Paragraph_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyUsage" ADD CONSTRAINT "DailyUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterUsage" ADD CONSTRAINT "ChapterUsage_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
