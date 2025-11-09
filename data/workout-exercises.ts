import { db } from "@/src/db";
import { workoutExercises, workouts, exercises, sets } from "@/src/db/schema";
import { eq, and, max } from "drizzle-orm";
import { getWorkoutByIdForUser } from "./workouts";
import type { Set } from "@/types/workout";

/**
 * Get all workout exercises with their details (exercise info and sets) for a specific workout
 * SECURITY: Validates workout ownership via userId before returning data
 */
export async function getWorkoutExercisesWithSets(
  userId: string,
  workoutId: number
) {
  // First verify the workout belongs to the user
  const workout = await getWorkoutByIdForUser(userId, workoutId);
  if (!workout) {
    return null;
  }

  // Get workout exercises with related exercise and sets data
  const results = await db
    .select()
    .from(workoutExercises)
    .leftJoin(exercises, eq(workoutExercises.exerciseId, exercises.id))
    .leftJoin(sets, eq(workoutExercises.id, sets.workoutExerciseId))
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(workoutExercises.order);

  // Group sets by workout exercise
  const exerciseMap = new Map();

  for (const row of results) {
    const workoutExerciseId = row.workout_exercises.id;

    if (!exerciseMap.has(workoutExerciseId)) {
      exerciseMap.set(workoutExerciseId, {
        ...row.workout_exercises,
        exercise: row.exercises!,
        sets: [],
      });
    }

    if (row.sets) {
      exerciseMap.get(workoutExerciseId).sets.push(row.sets);
    }
  }

  // Sort sets by set number for each exercise
  for (const exercise of exerciseMap.values()) {
    exercise.sets.sort((a: Set, b: Set) => a.setNumber - b.setNumber);
  }

  return Array.from(exerciseMap.values());
}

/**
 * Add an exercise to a workout
 * SECURITY: Validates workout ownership via userId before adding
 */
export async function addExerciseToWorkout(
  userId: string,
  workoutId: number,
  exerciseId: number
) {
  // First verify the workout belongs to the user
  const workout = await getWorkoutByIdForUser(userId, workoutId);
  if (!workout) {
    throw new Error("Workout not found or access denied");
  }

  // Get the max order number for this workout to append at the end
  const maxOrderResult = await db
    .select({ maxOrder: max(workoutExercises.order) })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));

  const nextOrder = (maxOrderResult[0]?.maxOrder ?? -1) + 1;

  const results = await db
    .insert(workoutExercises)
    .values({
      workoutId,
      exerciseId,
      order: nextOrder,
    })
    .returning();

  return results[0];
}

/**
 * Remove an exercise from a workout (and cascade delete all sets)
 * SECURITY: Validates workout ownership via userId before deleting
 */
export async function removeExerciseFromWorkout(
  userId: string,
  workoutExerciseId: number
) {
  // First, get the workout exercise to verify ownership
  const workoutExerciseResult = await db
    .select({
      workoutExercise: workoutExercises,
      workout: workouts,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workoutExercises.workoutId, workouts.id))
    .where(eq(workoutExercises.id, workoutExerciseId))
    .limit(1);

  if (
    !workoutExerciseResult[0] ||
    workoutExerciseResult[0].workout.userId !== userId
  ) {
    throw new Error("Workout exercise not found or access denied");
  }

  const results = await db
    .delete(workoutExercises)
    .where(eq(workoutExercises.id, workoutExerciseId))
    .returning();

  return results[0] || null;
}
