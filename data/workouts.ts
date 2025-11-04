import { db } from '@/src/db';
import { workouts } from '@/src/db/schema';
import { eq, and, lte, gte, or, isNull } from 'drizzle-orm';

/**
 * Get all workouts for a specific user
 * SECURITY: Always filters by userId to ensure data isolation
 */
export async function getWorkoutsForUser(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId))
    .orderBy(workouts.startedAt);
}

/**
 * Get workouts for a user that are active on a specific date
 * A workout is active on a date if:
 * - It started on or before that date (startedAt <= endOfDay)
 * - AND it's either still ongoing (completedAt is NULL) or ended on or after that date (completedAt >= startOfDay)
 *
 * This allows:
 * - Ongoing workouts to show on all dates from start date onwards
 * - Completed workouts to show only on dates within their start-end range
 *
 * SECURITY: Always filters by userId to ensure data isolation
 */
export async function getWorkoutsForUserOnDate(userId: string, startOfDay: Date, endOfDay: Date) {
  return await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        lte(workouts.startedAt, endOfDay),
        or(
          isNull(workouts.completedAt),
          gte(workouts.completedAt, startOfDay)
        )
      )
    )
    .orderBy(workouts.startedAt);
}

/**
 * Get a single workout by ID for a specific user
 * SECURITY: Always filters by userId to ensure data isolation
 */
export async function getWorkoutByIdForUser(userId: string, workoutId: number) {
  const results = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        eq(workouts.id, workoutId)
      )
    )
    .limit(1);

  return results[0] || null;
}
