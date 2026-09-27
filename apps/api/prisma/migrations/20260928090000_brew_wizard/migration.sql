-- Split brewMethod into drinkType (what was made) + equipment (dripper / machine),
-- add yieldGrams, and move ratings from a 1-10 scale to 1-5 stars.

-- AlterTable
ALTER TABLE "BrewJournal" ADD COLUMN "drinkType" TEXT;
ALTER TABLE "BrewJournal" ADD COLUMN "equipment" TEXT;
ALTER TABLE "BrewJournal" ADD COLUMN "yieldGrams" DOUBLE PRECISION;

-- Backfill existing rows
UPDATE "BrewJournal"
SET "drinkType" = CASE WHEN "brewMethod" = 'Espresso' THEN 'Espresso'
                       WHEN "brewMethod" = 'Cold Brew' THEN 'Cold Brew'
                       ELSE 'Manual Brew' END,
    "equipment" = CASE WHEN "brewMethod" IN ('Espresso', 'Cold Brew', 'Lainnya') THEN NULL
                       ELSE "brewMethod" END;

UPDATE "BrewJournal" SET "rating" = CEIL("rating" / 2.0) WHERE "rating" IS NOT NULL;
UPDATE "BrewJournal" SET "rating" = 1 WHERE "rating" < 1;

ALTER TABLE "BrewJournal" ALTER COLUMN "drinkType" SET NOT NULL;
ALTER TABLE "BrewJournal" DROP COLUMN "brewMethod";

-- Enforce the rating scale at the DB level too
ALTER TABLE "BrewJournal" ADD CONSTRAINT "BrewJournal_rating_check" CHECK ("rating" BETWEEN 1 AND 5);
