import { db } from "@/src/db";
import { sets, workoutExercises, workouts } from "@/src/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Helper function to verify workout exercise ownership
 * SECURITY: Ensures the workout exercise belongs to the user
 */
async function verifyWorkoutExerciseOwnership(
  userId: string,
  workoutExerciseId: number
) {
  const result = await db
    .select({
      workoutExercise: workoutExercises,
      workout: workouts,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1);

  if (!result[0] || result[0].workout.userId !== userId) {
    throw new Error("Workout exercise not found or access denied");
  }

  return result[0];
}

/**
 * Helper function to verify set ownership
 * SECURITY: Ensures the set belongs to the user via workout ownership
 */
async function verifySetOwnership(userId: string, setId: number) {
  const result = await db
    .select({
      set: sets,
      workoutExercise: workoutExercises,
      workout: workouts,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(sets.workoutExerciseId, workoutExercises.id))
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(eq(sets.id, setId))
    .limit(1);

  if (!result[0] || result[0].workout.userId !== userId) {
    throw new Error("Set not found or access denied");
  }

  return result[0];
}

/**
 * Create a new set for a workout exercise
 * SECURITY: Validates workout exercise ownership via userId
 */
export async function createSet(
  userId: string,
  workoutExerciseId: number,
  setNumber: number,
  weightKg: string,
  reps: number
) {
  // Verify ownership
  await verifyWorkoutExerciseOwnership(userId, workoutExerciseId);

  const results = await db
    .insert(sets)
    .values({
      workoutExerciseId,
      setNumber,
      weightKg,
      reps,
    })
    .returning();

  return results[0];
}

/**
 * Update an existing set
 * SECURITY: Validates set ownership via userId
 */
export async function updateSet(
  userId: string,
  setId: number,
  weightKg: string,
  reps: number
) {
  // Verify ownership
  await verifySetOwnership(userId, setId);

  const results = await db
    .update(sets)
    .set({
      weightKg,
      reps,
    })
    .where(eq(sets.id, setId))
    .returning();

  return results[0] || null;
}

/**
 * Delete a set
 * SECURITY: Validates set ownership via userId
 */
export async function deleteSet(userId: string, setId: number) {
  // Verify ownership
  await verifySetOwnership(userId, setId);

  const results = await db
    .delete(sets)
    .where(eq(sets.id, setId))
    .returning();

  return results[0] || null;
}
