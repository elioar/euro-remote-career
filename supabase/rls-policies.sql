-- ============================================================
-- RLS POLICIES — Euro Remote Career
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ============================================================
-- 1. USER TABLE
-- ============================================================
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;

-- Ο καθένας βλέπει μόνο τον εαυτό του
CREATE POLICY "user_select_own"
  ON "User" FOR SELECT
  USING (auth.uid() = id);

-- Ο καθένας μπορεί να ενημερώσει μόνο τον εαυτό του
CREATE POLICY "user_update_own"
  ON "User" FOR UPDATE
  USING (auth.uid() = id);

-- Insert γίνεται μόνο από το server (service role) — δεν χρειάζεται policy για authenticated users


-- ============================================================
-- 2. EMPLOYER PROFILE TABLE
-- ============================================================
ALTER TABLE "EmployerProfile" ENABLE ROW LEVEL SECURITY;

-- Όλοι βλέπουν employer profiles (εμφανίζονται στα job listings)
CREATE POLICY "employer_profile_select_public"
  ON "EmployerProfile" FOR SELECT
  USING (true);

-- Μόνο ο ίδιος μπορεί να ενημερώσει το προφίλ του
CREATE POLICY "employer_profile_update_own"
  ON "EmployerProfile" FOR UPDATE
  USING (auth.uid() = "userId");

-- Μόνο ο ίδιος μπορεί να εισάγει (create profile)
CREATE POLICY "employer_profile_insert_own"
  ON "EmployerProfile" FOR INSERT
  WITH CHECK (auth.uid() = "userId");


-- ============================================================
-- 3. CANDIDATE PROFILE TABLE
-- ============================================================
ALTER TABLE "CandidateProfile" ENABLE ROW LEVEL SECURITY;

-- Μόνο ο ίδιος βλέπει το δικό του profile
CREATE POLICY "candidate_profile_select_own"
  ON "CandidateProfile" FOR SELECT
  USING (auth.uid() = "userId");

-- Μόνο ο ίδιος μπορεί να ενημερώσει
CREATE POLICY "candidate_profile_update_own"
  ON "CandidateProfile" FOR UPDATE
  USING (auth.uid() = "userId");

-- Μόνο ο ίδιος μπορεί να εισάγει
CREATE POLICY "candidate_profile_insert_own"
  ON "CandidateProfile" FOR INSERT
  WITH CHECK (auth.uid() = "userId");


-- ============================================================
-- 4. JOB TABLE
-- ============================================================
ALTER TABLE "Job" ENABLE ROW LEVEL SECURITY;

-- Όλοι (και ανώνυμοι) βλέπουν PUBLISHED jobs
CREATE POLICY "job_select_published"
  ON "Job" FOR SELECT
  USING (status = 'PUBLISHED');

-- Ο employer βλέπει ΟΛΑ τα δικά του jobs (και drafts)
CREATE POLICY "job_select_own_employer"
  ON "Job" FOR SELECT
  USING (
    "employerId" IN (
      SELECT id FROM "EmployerProfile" WHERE "userId" = auth.uid()
    )
  );

-- Ο employer μπορεί να δημιουργήσει job
CREATE POLICY "job_insert_employer"
  ON "Job" FOR INSERT
  WITH CHECK (
    "employerId" IN (
      SELECT id FROM "EmployerProfile" WHERE "userId" = auth.uid()
    )
  );

-- Ο employer μπορεί να ενημερώσει μόνο τα δικά του jobs
CREATE POLICY "job_update_employer"
  ON "Job" FOR UPDATE
  USING (
    "employerId" IN (
      SELECT id FROM "EmployerProfile" WHERE "userId" = auth.uid()
    )
  );

-- Ο employer μπορεί να διαγράψει μόνο τα δικά του jobs (DRAFT/ARCHIVED)
CREATE POLICY "job_delete_employer"
  ON "Job" FOR DELETE
  USING (
    "employerId" IN (
      SELECT id FROM "EmployerProfile" WHERE "userId" = auth.uid()
    )
    AND status IN ('DRAFT', 'ARCHIVED')
  );

-- ADMIN μπορεί να κάνει τα πάντα
CREATE POLICY "job_admin_all"
  ON "Job" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
  );


-- ============================================================
-- 5. APPLICATION TABLE
-- ============================================================
ALTER TABLE "Application" ENABLE ROW LEVEL SECURITY;

-- Candidate βλέπει μόνο τις δικές του αιτήσεις
CREATE POLICY "application_select_candidate"
  ON "Application" FOR SELECT
  USING (
    "candidateId" IN (
      SELECT id FROM "CandidateProfile" WHERE "userId" = auth.uid()
    )
  );

-- Employer βλέπει αιτήσεις για τα δικά του jobs
CREATE POLICY "application_select_employer"
  ON "Application" FOR SELECT
  USING (
    "jobId" IN (
      SELECT j.id FROM "Job" j
      JOIN "EmployerProfile" ep ON j."employerId" = ep.id
      WHERE ep."userId" = auth.uid()
    )
  );

-- Candidate μπορεί να υποβάλει αίτηση
CREATE POLICY "application_insert_candidate"
  ON "Application" FOR INSERT
  WITH CHECK (
    "candidateId" IN (
      SELECT id FROM "CandidateProfile" WHERE "userId" = auth.uid()
    )
  );

-- Candidate μπορεί να αποσύρει αίτηση (delete)
CREATE POLICY "application_delete_candidate"
  ON "Application" FOR DELETE
  USING (
    "candidateId" IN (
      SELECT id FROM "CandidateProfile" WHERE "userId" = auth.uid()
    )
  );

-- Employer μπορεί να ενημερώσει status αίτησης
CREATE POLICY "application_update_employer"
  ON "Application" FOR UPDATE
  USING (
    "jobId" IN (
      SELECT j.id FROM "Job" j
      JOIN "EmployerProfile" ep ON j."employerId" = ep.id
      WHERE ep."userId" = auth.uid()
    )
  );

-- ADMIN βλέπει τα πάντα
CREATE POLICY "application_admin_all"
  ON "Application" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
  );


-- ============================================================
-- 6. MODERATION LOG TABLE
-- ============================================================
ALTER TABLE "ModerationLog" ENABLE ROW LEVEL SECURITY;

-- Μόνο ADMIN έχει πρόσβαση
CREATE POLICY "moderation_log_admin_only"
  ON "ModerationLog" FOR ALL
  USING (
    EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid() AND role = 'ADMIN')
  );


-- ============================================================
-- 7. SERVER-SIDE: επιτρέπουμε service_role να κάνει τα πάντα
-- (το Next.js backend χρησιμοποιεί service role key)
-- Αυτό ισχύει by default — service_role bypasses RLS
-- Βεβαιώσου ότι χρησιμοποιείς SUPABASE_SERVICE_ROLE_KEY
-- μόνο server-side και ΠΟΤΕ στο client/browser.
-- ============================================================
