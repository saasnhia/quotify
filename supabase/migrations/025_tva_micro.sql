-- Fix #4: TVA intracommunautaire + Fix #5: Micro-entrepreneur
-- Adds fiscal identification fields to profiles

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tva_number VARCHAR(25);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS tva_applicable BOOLEAN DEFAULT TRUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_micro_entrepreneur BOOLEAN DEFAULT FALSE;
