-- CreateTable
CREATE TABLE "Lead" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "website" TEXT,
    "contactEmail" TEXT,
    "rating" REAL,
    "placeId" TEXT NOT NULL,
    "searchQuery" TEXT,
    "searchLocation" TEXT,
    "industry" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "aiScore" INTEGER,
    "aiGrade" TEXT,
    "aiStatus" TEXT NOT NULL DEFAULT 'pending',
    "aiTags" TEXT NOT NULL DEFAULT '[]',
    "contactAttempts" INTEGER NOT NULL DEFAULT 0,
    "lastContacted" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LeadAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "leadId" INTEGER NOT NULL,
    "techStack" TEXT NOT NULL DEFAULT '[]',
    "uxAssessment" TEXT,
    "mobileFriendly" BOOLEAN,
    "businessInsight" TEXT,
    "detailedAnalysis" TEXT,
    "aiConfidence" REAL,
    "generatedEmail" TEXT,
    "emailSubjects" TEXT NOT NULL DEFAULT '[]',
    "posterDescription" TEXT,
    "posterUrl" TEXT,
    CONSTRAINT "LeadAnalysis_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_placeId_key" ON "Lead"("placeId");

-- CreateIndex
CREATE UNIQUE INDEX "LeadAnalysis_leadId_key" ON "LeadAnalysis"("leadId");
