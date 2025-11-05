import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { WorkoutForm } from './_components/workout-form'

/**
 * New Workout Page
 * Following /docs/auth.md guidelines:
 * - Using server-side auth() for authentication check
 * - Redirecting unauthenticated users to sign-in
 */
export default async function NewWorkoutPage() {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">New Workout</h1>
          <p className="text-muted-foreground">
            Create a new workout session to track your training
          </p>
        </div>

        {/* Workout Form */}
        <WorkoutForm />
      </div>
    </div>
  )
}
