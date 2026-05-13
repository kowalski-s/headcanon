-- CreateEnum
CREATE TYPE "FocusType" AS ENUM ('ROMANCE', 'GEN', 'CHARACTER_STUDY', 'FRIENDSHIP');

-- CreateEnum
CREATE TYPE "Rating" AS ENUM ('GENERAL', 'TEEN', 'MATURE', 'EXPLICIT');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('SLASH', 'FEMSLASH', 'HET', 'GEN', 'MULTI', 'OTHER');

-- CreateEnum
CREATE TYPE "Pov" AS ENUM ('FIRST', 'CLOSE_THIRD', 'OMNISCIENT');

-- CreateEnum
CREATE TYPE "Tense" AS ENUM ('PAST', 'PRESENT');

-- AlterEnum: add new Tone values
ALTER TYPE "Tone" ADD VALUE 'HURT_COMFORT';
ALTER TYPE "Tone" ADD VALUE 'CRACK';
ALTER TYPE "Tone" ADD VALUE 'DARK';

-- AlterTable CreateDraft: ADD new columns first (before backfill UPDATEs)
ALTER TABLE "CreateDraft"
ADD COLUMN "category" "Category",
ADD COLUMN "characters" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "focusType" "FocusType",
ADD COLUMN "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "pov" "Pov",
ADD COLUMN "premise" TEXT,
ADD COLUMN "rating" "Rating",
ADD COLUMN "tense" "Tense",
ADD COLUMN "timeline" TEXT,
ADD COLUMN "timelineNote" TEXT,
ADD COLUMN "tones" "Tone"[] DEFAULT ARRAY[]::"Tone"[],
ADD COLUMN "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Backfill characters[] from old shipId by splitting on common ship separators.
UPDATE "CreateDraft"
SET "characters" = CASE
  WHEN "shipId" IS NULL OR "shipId" = '' THEN '{}'::text[]
  WHEN "shipId" ~ '\s*[×x/]\s*' THEN regexp_split_to_array("shipId", '\s*[×x/]\s*')
  ELSE ARRAY["shipId"]
END;

-- Default focusType for existing drafts that had a ship.
UPDATE "CreateDraft" SET "focusType" = 'ROMANCE' WHERE "shipId" IS NOT NULL;

-- Backfill tones[] from old tone (CreateDraft only — Story.tone is preserved).
UPDATE "CreateDraft" SET "tones" = CASE
  WHEN "tone" IS NULL THEN '{}'::"Tone"[]
  ELSE ARRAY["tone"]::"Tone"[]
END;

-- AlterTable CreateDraft: DROP old columns after backfill
ALTER TABLE "CreateDraft"
DROP COLUMN "shipId",
DROP COLUMN "tone";

-- AlterTable Story: add new AO3 fields (tone column is preserved for backward-compat)
ALTER TABLE "Story"
ADD COLUMN "category" "Category",
ADD COLUMN "focusType" "FocusType",
ADD COLUMN "genres" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "pov" "Pov",
ADD COLUMN "rating" "Rating",
ADD COLUMN "tense" "Tense",
ADD COLUMN "timeline" TEXT,
ADD COLUMN "timelineNote" TEXT,
ADD COLUMN "tones" "Tone"[] DEFAULT ARRAY[]::"Tone"[],
ADD COLUMN "warnings" TEXT[] DEFAULT ARRAY[]::TEXT[];
