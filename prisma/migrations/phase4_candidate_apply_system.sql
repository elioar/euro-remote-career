-- Phase 4: Candidate Apply System + ATS-lite
-- Run this in Supabase SQL Editor (Database → SQL Editor)

-- 1. Create CandidateCV table
CREATE TABLE IF NOT EXISTS "CandidateCV" (
    "id" TEXT NOT NULL,
    "candidateId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storagePath" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CandidateCV_pkey" PRIMARY KEY ("id")
);

-- 2. Add index
CREATE INDEX IF NOT EXISTS "CandidateCV_candidateId_idx" ON "CandidateCV"("candidateId");

-- 3. Add foreign key
ALTER TABLE "CandidateCV"
    ADD CONSTRAINT "CandidateCV_candidateId_fkey"
    FOREIGN KEY ("candidateId") REFERENCES "CandidateProfile"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Migrate existing cvPath data → CandidateCV rows
INSERT INTO "CandidateCV" ("id", "candidateId", "fileName", "storagePath", "uploadedAt")
SELECT
    gen_random_uuid()::text,
    id,
    -- Extract filename from path like "userId/filename.pdf"
    CASE
        WHEN "cvPath" LIKE '%/%'
        THEN split_part("cvPath", '/', array_length(string_to_array("cvPath", '/'), 1))
        ELSE "cvPath"
    END,
    "cvPath",
    NOW()
FROM "CandidateProfile"
WHERE "cvPath" IS NOT NULL AND "cvPath" <> '';

-- 5. Remove old cvPath column from CandidateProfile
ALTER TABLE "CandidateProfile" DROP COLUMN IF EXISTS "cvPath";

-- 6. Add cvPath to Application (which CV was used for this application)
ALTER TABLE "Application" ADD COLUMN IF NOT EXISTS "cvPath" TEXT;
