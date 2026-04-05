-- Nom de l'auteur dans les transactions de trésorerie
ALTER TABLE "TreasuryTransaction" ADD COLUMN IF NOT EXISTS "createdByName" TEXT;

-- Image URL dans les annonces, notes et comptes-rendus
ALTER TABLE "Announcement" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "SharedNote" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
ALTER TABLE "MeetingReport" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;
