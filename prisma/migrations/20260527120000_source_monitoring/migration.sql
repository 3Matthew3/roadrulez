-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GOVERNMENT', 'POLICE', 'MINISTRY', 'AUTOMOBILE_ASSOCIATION', 'LEGAL_DATABASE', 'SECONDARY');

-- CreateEnum
CREATE TYPE "TrustLevel" AS ENUM ('PRIMARY', 'TRUSTED_SECONDARY', 'UNVERIFIED');

-- CreateEnum
CREATE TYPE "SourceCheckStatus" AS ENUM ('OK', 'CHANGED', 'FAILED', 'NEEDS_REVIEW');

-- CreateEnum
CREATE TYPE "SourceReviewStatus" AS ENUM ('OPEN', 'APPROVED', 'REJECTED');

-- AlterTable
ALTER TABLE "sources" ADD COLUMN "sourceType" "SourceType" NOT NULL DEFAULT 'SECONDARY',
ADD COLUMN "trustLevel" "TrustLevel" NOT NULL DEFAULT 'UNVERIFIED',
ADD COLUMN "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "lastCheckedAt" TIMESTAMP(3),
ADD COLUMN "lastChangedAt" TIMESTAMP(3),
ADD COLUMN "contentHash" TEXT,
ADD COLUMN "checkStatus" "SourceCheckStatus" NOT NULL DEFAULT 'OK';

-- CreateTable
CREATE TABLE "source_checks" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "SourceCheckStatus" NOT NULL,
    "oldHash" TEXT,
    "newHash" TEXT,
    "httpStatus" INTEGER,
    "error" TEXT,
    "contentSnippet" TEXT,
    "diffSummary" TEXT,

    CONSTRAINT "source_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_reviews" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "countryId" TEXT,
    "moduleKey" TEXT,
    "fieldName" TEXT,
    "currentValue" TEXT,
    "suggestedValue" TEXT,
    "evidenceSnippet" TEXT,
    "status" "SourceReviewStatus" NOT NULL DEFAULT 'OPEN',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "source_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "source_checks_sourceId_checkedAt_idx" ON "source_checks"("sourceId", "checkedAt");

-- CreateIndex
CREATE INDEX "source_reviews_status_createdAt_idx" ON "source_reviews"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "source_checks" ADD CONSTRAINT "source_checks_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_reviews" ADD CONSTRAINT "source_reviews_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "sources"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_reviews" ADD CONSTRAINT "source_reviews_countryId_fkey" FOREIGN KEY ("countryId") REFERENCES "countries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_reviews" ADD CONSTRAINT "source_reviews_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
