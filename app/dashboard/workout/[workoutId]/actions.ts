'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { updateWorkoutForUser, getWorkoutByIdForUser } from '@/data/workouts'
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
