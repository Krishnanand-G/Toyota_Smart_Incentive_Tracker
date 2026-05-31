-- Rename default incentive tier labels to dealer-style performance bands.
UPDATE "IncentiveSlab" SET "label" = 'Foundation' WHERE "minUnits" = 0;
UPDATE "IncentiveSlab" SET "label" = 'Achiever' WHERE "minUnits" = 10;
UPDATE "IncentiveSlab" SET "label" = 'Performer' WHERE "minUnits" = 20;
UPDATE "IncentiveSlab" SET "label" = 'Elite' WHERE "minUnits" >= 30;
