import { db } from "@/src/db";
import { exercises } from "@/src/db/schema";
import { eq } from "drizzle-orm";

/**
 * Get all exercises
 * NOTE: Exercises are global reference data, not user-specific
 */
export async function getAllExercises() {
  return await db
    .select()
    .from(exercises)
    .orderBy(exercises.name);
}

/**
 * Get a single exercise by ID
 */
export async function getExerciseById(exerciseId: number) {
  const results = await db
    .select()
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .limit(1);

  return results[0] || null;
}

/**
 * Get a single exercise by name (case-insensitive)
 */
export async function getExerciseByName(name: string) {
  const results = await db
    .select()
    .from(exercises)
    .where(eq(exercises.name, name.trim()))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new exercise
 * NOTE: Exercises are global reference data
 */
export async function createExercise(name: string) {
  const results = await db
    .insert(exercises)
    .values({
      name: name.trim(),
    })
    .returning();

  return results[0];
}

/**
 * Get or create an exercise by name
 * If an exercise with the given name exists, return it
 * Otherwise, create a new exercise and return it
 */
export async function getOrCreateExercise(name: string) {
  const existingExercise = await getExerciseByName(name);

  if (existingExercise) {
    return existingExercise;
  }

  return await createExercise(name);
}
