-- Migration: Add UI configuration columns to Services table
-- Task E2+E3: Control Custom For You modal visibility per service
-- Run this in Supabase SQL Editor

-- Step 1: Add 3 new boolean columns (default true for backward compatibility)
ALTER TABLE "Services" ADD COLUMN IF NOT EXISTS "showCustomForYou" boolean DEFAULT true;
ALTER TABLE "Services" ADD COLUMN IF NOT EXISTS "showNotes" boolean DEFAULT true;
ALTER TABLE "Services" ADD COLUMN IF NOT EXISTS "showPreferences" boolean DEFAULT true;

-- Step 2: Set Private Room (NHS1000) to skip Custom For You modal entirely
UPDATE "Services" SET "showCustomForYou" = false WHERE "id" = 'NHS1000';

-- Step 3: Set Barber Package 1-3 to hide Preferences (Strength + Gender selection)
-- ⚠️ IMPORTANT: Replace these IDs with the actual Barber Package 1-3 IDs in your database
-- UPDATE "Services" SET "showPreferences" = false WHERE "id" IN ('NHS_BARBER_1', 'NHS_BARBER_2', 'NHS_BARBER_3');

-- Verify changes
SELECT "id", "nameEN", "category", "showCustomForYou", "showNotes", "showPreferences"
FROM "Services"
WHERE "showCustomForYou" = false OR "showNotes" = false OR "showPreferences" = false
ORDER BY "id";
