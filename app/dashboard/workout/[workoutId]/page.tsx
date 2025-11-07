import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { getWorkoutByIdForUser } from '@/data/workouts'
import { WorkoutEditForm } from './_components/workout-edit-form'

/**
 * Workout edit page
 * Following /docs/data-fetching.md guidelines:
 * - Using Server Component for data fetching
 * - Using helper function from /data directory
 * - Filtering by userId (critical security requirement)
 */
export default async function WorkoutEditPage({
  params,
}: {
  params: Promise<{ workoutId: string }>
}) {
  // Get authenticated user
  // Following /docs/auth.md guidelines:
  // - Using server-side auth() from @clerk/nextjs/server
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  const { workoutId } = await params
  const workoutIdNum = parseInt(workoutId, 10)

  if (isNaN(workoutIdNum)) {
    notFound()
  }

  // Fetch workout data using helper function
  // Following /docs/data-fetching.md guidelines:
  // - Using helper function from /data directory
  // - Helper function filters by userId (critical security requirement)
  const workout = await getWorkoutByIdForUser(userId, workoutIdNum)

  if (!workout) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <WorkoutEditForm workout={workout} />
    </div>
  )
}
