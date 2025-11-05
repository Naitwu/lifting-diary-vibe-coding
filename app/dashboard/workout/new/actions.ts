'use server'

import { auth } from '@clerk/nextjs/server'
import { z } from 'zod'
import { createWorkoutForUser } from '@/data/workouts'

/**
 * Validation schema for creating a new workout
 * Following /docs/data-mutations.md guidelines:
 * - Using Zod for input validation
 * - Strongly-typed parameters (NOT FormData)
 *
 * Note: We accept ISO 8601 datetime strings and will parse them as-is.
 * The client should send local time in ISO format (YYYY-MM-DDTHH:mm:ss).
 */
const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Workout name is required').max(255, 'Name is too long'),
  startedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format'),
  completedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/, 'Invalid date format').optional().nullable(),
})

export type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>

export async function createWorkout(input: CreateWorkoutInput) {
  // Get authenticated user
  // Following /docs/auth.md guidelines:
  // - Using server-side auth() from @clerk/nextjs/server
  const { userId } = await auth()

  if (!userId) {
    throw new Error('Unauthorized')
  }

  // Validate input
  const validatedInput = createWorkoutSchema.parse(input)

  // Convert string dates to Date objects
  const startedAt = new Date(validatedInput.startedAt)
  const completedAt = validatedInput.completedAt ? new Date(validatedInput.completedAt) : null

  // Create workout using helper function from /data directory
  // Following /docs/data-mutations.md guidelines:
  // - Using helper function from /data directory
  // - Helper function filters by userId (critical security requirement)
  const workout = await createWorkoutForUser(userId, {
    name: validatedInput.name,
    startedAt,
    completedAt,
  })

  // Return success result
  // Client will handle redirect
  return { success: true, workoutId: workout.id }
}
