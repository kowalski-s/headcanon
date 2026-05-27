-- CreateEnum
CREATE TYPE "StorySource" AS ENUM ('WRITTEN', 'GENERATED');

-- AlterTable
ALTER TABLE "Story" ADD COLUMN "source" "StorySource" NOT NULL DEFAULT 'WRITTEN';

-- Все истории, существовавшие до пивота v2 — generator path
UPDATE "Story" SET "source" = 'GENERATED' WHERE "createdAt" < NOW();
