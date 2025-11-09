import { auth } from '@clerk/nextjs/server'
import { notFound, redirect } from 'next/navigation'
import { getWorkoutByIdForUser } from '@/data/workouts'
import { getAllExercises } from '@/data/exercises'
import { getWorkoutExercisesWithSets } from '@/data/workout-exercises'
import { WorkoutHeader } from './_components/workout-header'
import { AddExerciseButton } from './_components/add-exercise-button'
import { ExerciseItem } from './_components/exercise-item'

/**
 * Workout detail page with exercise and set logging
 * Following /docs/data-fetching.md guidelines:
 * - Using Server Component for data fetching
 * - Using helper functions from /data directory
 * - Filtering by userId (critical security requirement)
 */
export default async function WorkoutDetailPage({
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

  // Fetch workout data and exercises
  // Following /docs/data-fetching.md guidelines:
  // - Using helper functions from /data directory
  // - Helper functions filter by userId (critical security requirement)
  const [workout, workoutExercises, allExercises] = await Promise.all([
    getWorkoutByIdForUser(userId, workoutIdNum),
    getWorkoutExercisesWithSets(userId, workoutIdNum),
    getAllExercises(),
  ])

  if (!workout || workoutExercises === null) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        {/* Workout Header */}
        <WorkoutHeader workout={workout} />

        {/* Exercises Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Exercises</h2>
            <AddExerciseButton
              workoutId={workoutIdNum}
              exercises={allExercises}
            />
          </div>

          {/* Exercise List */}
          {workoutExercises.length > 0 ? (
            <div className="space-y-4">
              {workoutExercises.map((workoutExercise) => (
                <ExerciseItem
                  key={workoutExercise.id}
                  workoutExercise={workoutExercise}
                  workoutId={workoutIdNum}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-4">
                No exercises added yet
              </p>
              <p className="text-sm text-muted-foreground">
                Click "Add Exercise" to start logging your workout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
