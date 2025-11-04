-- Migration: Convert existing timestamps to UTC and add timezone support
-- Strategy:
--   - Storage: All timestamps stored in UTC
--   - Display: Show in user's timezone (default: Asia/Taipei)
--
-- Current situation: Existing data is stored as local time (UTC+8)
-- This migration converts existing data to UTC by subtracting 8 hours,
-- then changes column type to 'timestamp with time zone'

-- Exercises table
-- Convert local time (UTC+8) to UTC by subtracting 8 hours
ALTER TABLE "exercises"
  ALTER COLUMN "created_at" TYPE timestamp with time zone
    USING "created_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE timestamp with time zone
    USING "updated_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC';

-- Workouts table
-- Convert local time (UTC+8) to UTC by subtracting 8 hours
ALTER TABLE "workouts"
  ALTER COLUMN "started_at" TYPE timestamp with time zone
    USING "started_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC',
  ALTER COLUMN "completed_at" TYPE timestamp with time zone
    USING "completed_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE timestamp with time zone
    USING "created_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE timestamp with time zone
    USING "updated_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC';

-- Workout Exercises table
ALTER TABLE "workout_exercises"
  ALTER COLUMN "created_at" TYPE timestamp with time zone
    USING "created_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC';

-- Sets table
ALTER TABLE "sets"
  ALTER COLUMN "created_at" TYPE timestamp with time zone
    USING "created_at" AT TIME ZONE 'Asia/Taipei' AT TIME ZONE 'UTC';

-- After this migration:
-- - Database: 2025-11-04 09:00:00+08 -> 2025-11-04 01:00:00+00 (UTC)
-- - Display: Will show as 09:00 in Asia/Taipei timezone ✓
