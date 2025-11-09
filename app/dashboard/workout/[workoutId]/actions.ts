'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { updateWorkoutForUser, getWorkoutByIdForUser, deleteWorkoutForUser } from '@/data/workouts'
import { getOrCreateExercise } from '@/data/exercises'
import { addExerciseToWorkout as addExerciseToWorkoutData, removeExerciseFromWorkout as removeExerciseFromWorkoutData } from '@/data/workout-exercises'
import { createSet as createSetData, updateSet as updateSetData, deleteSet as deleteSetData } from '@/data/sets'
import { revalidatePath } from 'next/cache'

/**
 * Validation schema for updating a workout
 * Following /docs/data-mutations.md guidelines:
 * - Using Zod for input validation
 * - Strongly-typed parameters (NOT FormData)
 *
 * Note: We accept ISO 8601 datetime strings and will parse them as-is.
 * The client should send local time in ISO format (YYYY-MM-DDTHH:mm:ss).
 */
const updateWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
  name: z.string().min(1, 'Workout name is required').max(255, 'Name is too long'),
  startedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format'),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format').optional().nullable(),
})

export type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>

export async function updateWorkout(input: UpdateWorkoutInput) {
  // Get authenticated user
  // Following /docs/auth.md guidelines:
  // - Using server-side auth() from @clerk/nextjs/server
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = updateWorkoutSchema.parse(input)

  // Verify that the workout belongs to the user
  const existingWorkout = await getWorkoutByIdForUser(userId, validatedInput.workoutId)
  if (!existingWorkout) {
    throw new Error('Workout not found')
  }

  // Convert string dates to Date objects
  const startedAt = new Date(validatedInput.startedAt)
  const completedAt = validatedInput.completedAt ? new Date(validatedInput.completedAt) : null

  // Update workout using helper function from /data directory
  // Following /docs/data-mutations.md guidelines:
  // - Using helper function from /data directory
  // - Helper function filters by userId (critical security requirement)
  const workout = await updateWorkoutForUser(userId, validatedInput.workoutId, {
    name: validatedInput.name,
    startedAt,
    completedAt,
  })

  if (!workout) {
    throw new Error('Failed to update workout')
  }

  // Revalidate the dashboard page to reflect changes
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/workout/${validatedInput.workoutId}`)

  // Return success result
  return { success: true, workoutId: workout.id }
}

/**
 * Validation schema for deleting a workout
 * Following /docs/data-mutations.md guidelines:
 * - Using Zod for input validation
 * - Strongly-typed parameters (NOT FormData)
 */
const deleteWorkoutSchema = z.object({
  workoutId: z.number().int().positive(),
})

export type DeleteWorkoutInput = z.infer<typeof deleteWorkoutSchema>

export async function deleteWorkout(input: DeleteWorkoutInput) {
  // Get authenticated user
  // Following /docs/auth.md guidelines:
  // - Using server-side auth() from @clerk/nextjs/server
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = deleteWorkoutSchema.parse(input)

  // Verify that the workout belongs to the user
  const existingWorkout = await getWorkoutByIdForUser(userId, validatedInput.workoutId)
  if (!existingWorkout) {
    throw new Error('Workout not found')
  }

  // Delete workout using helper function from /data directory
  // Following /docs/data-mutations.md guidelines:
  // - Using helper function from /data directory
  // - Helper function filters by userId (critical security requirement)
  const deletedWorkout = await deleteWorkoutForUser(userId, validatedInput.workoutId)

  if (!deletedWorkout) {
    throw new Error('Failed to delete workout')
  }

  // Revalidate the dashboard page to reflect changes
  revalidatePath('/dashboard')

  // Return success result
  // Client component will handle redirect
  return { success: true, workoutId: deletedWorkout.id }
}

/**
 * Validation schema for adding an exercise to a workout
 * Following /docs/data-mutations.md guidelines:
 * - Using Zod for input validation
 * - Strongly-typed parameters (NOT FormData)
 */
const addExerciseSchema = z.object({
  workoutId: z.number().int().positive(),
  exerciseName: z.string().min(1, 'Exercise name is required').max(255, 'Name is too long'),
})

export type AddExerciseInput = z.infer<typeof addExerciseSchema>

export async function addExercise(input: AddExerciseInput) {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = addExerciseSchema.parse(input)

  // Verify that the workout belongs to the user
  const existingWorkout = await getWorkoutByIdForUser(userId, validatedInput.workoutId)
  if (!existingWorkout) {
    throw new Error('Workout not found')
  }

  // Get or create the exercise
  const exercise = await getOrCreateExercise(validatedInput.exerciseName)

  // Add exercise to workout
  const workoutExercise = await addExerciseToWorkoutData(
    userId,
    validatedInput.workoutId,
    exercise.id
  )

  // Revalidate the workout page
  revalidatePath(`/dashboard/workout/${validatedInput.workoutId}`)

  return { success: true, workoutExerciseId: workoutExercise.id }
}

/**
 * Validation schema for removing an exercise from a workout
 */
const removeExerciseSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  workoutId: z.number().int().positive(), // For revalidation
})

export type RemoveExerciseInput = z.infer<typeof removeExerciseSchema>

export async function removeExercise(input: RemoveExerciseInput) {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = removeExerciseSchema.parse(input)

  // Remove exercise from workout (helper validates ownership)
  await removeExerciseFromWorkoutData(userId, validatedInput.workoutExerciseId)

  // Revalidate the workout page
  revalidatePath(`/dashboard/workout/${validatedInput.workoutId}`)

  return { success: true }
}

/**
 * Validation schema for logging a set
 */
const logSetSchema = z.object({
  workoutExerciseId: z.number().int().positive(),
  setNumber: z.number().int().positive(),
  weightKg: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Weight must be a valid number with up to 2 decimal places'),
  reps: z.number().int().positive(),
  workoutId: z.number().int().positive(), // For revalidation
})

export type LogSetInput = z.infer<typeof logSetSchema>

export async function logSet(input: LogSetInput) {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = logSetSchema.parse(input)

  // Create set (helper validates ownership)
  const set = await createSetData(
    userId,
    validatedInput.workoutExerciseId,
    validatedInput.setNumber,
    validatedInput.weightKg,
    validatedInput.reps
  )

  // Revalidate the workout page
  revalidatePath(`/dashboard/workout/${validatedInput.workoutId}`)

  return { success: true, setId: set.id }
}

/**
 * Validation schema for updating a set
 */
const updateSetActionSchema = z.object({
  setId: z.number().int().positive(),
  weightKg: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Weight must be a valid number with up to 2 decimal places'),
  reps: z.number().int().positive(),
  workoutId: z.number().int().positive(), // For revalidation
})

export type UpdateSetInput = z.infer<typeof updateSetActionSchema>

export async function updateSetAction(input: UpdateSetInput) {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = updateSetActionSchema.parse(input)

  // Update set (helper validates ownership)
  const set = await updateSetData(
    userId,
    validatedInput.setId,
    validatedInput.weightKg,
    validatedInput.reps
  )

  if (!set) {
    throw new Error('Failed to update set')
  }

  // Revalidate the workout page
  revalidatePath(`/dashboard/workout/${validatedInput.workoutId}`)

  return { success: true, setId: set.id }
}

/**
 * Validation schema for deleting a set
 */
const deleteSetActionSchema = z.object({
  setId: z.number().int().positive(),
  workoutId: z.number().int().positive(), // For revalidation
})

export type DeleteSetInput = z.infer<typeof deleteSetActionSchema>

export async function deleteSetAction(input: DeleteSetInput) {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = deleteSetActionSchema.parse(input)

  // Delete set (helper validates ownership)
  await deleteSetData(userId, validatedInput.setId)

  // Revalidate the workout page
  revalidatePath(`/dashboard/workout/${validatedInput.workoutId}`)

  return { success: true }
}
