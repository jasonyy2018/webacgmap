/*
  Warnings:

  - You are about to drop the column `aiGrade` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `aiScore` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `aiStatus` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `aiTags` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `contactAttempts` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `lastContacted` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `placeId` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `searchLocation` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `searchQuery` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Lead` table. All the data in the column will be lost.
  - You are about to drop the column `aiConfidence` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `businessInsight` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `detailedAnalysis` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `emailSubjects` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `generatedEmail` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `leadId` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `mobileFriendly` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `posterDescription` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `posterUrl` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `techStack` on the `LeadAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `uxAssessment` on the `LeadAnalysis` table. All the data in the column will be lost.
  - Added the required column `place_id` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Lead` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lead_id` to the `LeadAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "contact_email" TEXT,
    "rating" REAL,
    "place_id" TEXT NOT NULL,
    "search_query" TEXT,
    "search_location" TEXT,
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "ai_score" INTEGER,
    "ai_grade" TEXT,
    "ai_status" TEXT NOT NULL DEFAULT 'pending',
    "ai_tags" TEXT NOT NULL DEFAULT '[]',
    "contact_attempts" INTEGER NOT NULL DEFAULT 0,
    "last_contacted" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_Lead" ("address", "id", "industry", "name", "phone", "rating", "status", "website") SELECT "address", "id", "industry", "name", "phone", "rating", "status", "website" FROM "Lead";
DROP TABLE "Lead";
ALTER TABLE "new_Lead" RENAME TO "Lead";
CREATE UNIQUE INDEX "Lead_place_id_key" ON "Lead"("place_id");
CREATE TABLE "new_LeadAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "lead_id" INTEGER NOT NULL,
    "tech_stack" TEXT NOT NULL DEFAULT '[]',
    "ux_assessment" TEXT,
    "mobile_friendly" BOOLEAN,
    "business_insight" TEXT,
    "detailed_analysis" TEXT,
    "ai_confidence" REAL,
    "generated_email" TEXT,
    "email_subjects" TEXT NOT NULL DEFAULT '[]',
    "poster_description" TEXT,
    "poster_url" TEXT,
    CONSTRAINT "LeadAnalysis_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_LeadAnalysis" ("id") SELECT "id" FROM "LeadAnalysis";
DROP TABLE "LeadAnalysis";
ALTER TABLE "new_LeadAnalysis" RENAME TO "LeadAnalysis";
CREATE UNIQUE INDEX "LeadAnalysis_lead_id_key" ON "LeadAnalysis"("lead_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
