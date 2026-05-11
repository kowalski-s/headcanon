-- AlterTable
ALTER TABLE "Story" ADD COLUMN     "aiTagSuggestion" JSONB;

-- AlterTable
ALTER TABLE "StoryTag" ADD COLUMN     "prefilled" BOOLEAN NOT NULL DEFAULT false;
