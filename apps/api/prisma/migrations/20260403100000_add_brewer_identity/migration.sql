-- CreateEnum
CREATE TYPE "BrewerIdentity" AS ENUM ('BEGINNER', 'HOME_BREWER', 'BARISTA_CAFE', 'BARISTA_COMPETITION');

-- AlterTable
ALTER TABLE "User" ADD COLUMN "brewerIdentity" "BrewerIdentity",
ADD COLUMN "identitySetAt" TIMESTAMP(3),
ADD COLUMN "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;
