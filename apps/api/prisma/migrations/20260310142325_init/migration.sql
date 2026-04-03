-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bean" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roastery" TEXT NOT NULL,
    "beanName" TEXT NOT NULL,
    "originCountry" TEXT NOT NULL,
    "originRegion" TEXT,
    "altitude" INTEGER,
    "varietal" TEXT,
    "process" TEXT,
    "roastLevel" TEXT,
    "roastDate" TIMESTAMP(3),
    "photoUrl" TEXT,
    "notes" TEXT,
    "scannedAt" TIMESTAMP(3),
    "expectedBodyness" INTEGER,
    "expectedSweetness" INTEGER,
    "expectedAcidity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bean_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrewJournal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "beanId" TEXT NOT NULL,
    "brewMethod" TEXT NOT NULL,
    "grinder" TEXT,
    "grindSize" TEXT,
    "doseGrams" DOUBLE PRECISION,
    "waterMl" DOUBLE PRECISION,
    "ratio" TEXT,
    "waterTempC" INTEGER,
    "brewTimeSec" INTEGER,
    "pourCount" INTEGER,
    "pourDetails" JSONB,
    "tastingNotes" TEXT[],
    "rating" INTEGER,
    "notes" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "actualBodyness" INTEGER,
    "actualSweetness" INTEGER,
    "actualAcidity" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BrewJournal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Bean" ADD CONSTRAINT "Bean_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrewJournal" ADD CONSTRAINT "BrewJournal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrewJournal" ADD CONSTRAINT "BrewJournal_beanId_fkey" FOREIGN KEY ("beanId") REFERENCES "Bean"("id") ON DELETE CASCADE ON UPDATE CASCADE;
