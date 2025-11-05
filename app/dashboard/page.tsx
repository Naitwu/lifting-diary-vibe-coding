import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatDate, formatTime, calculateDuration, formatDuration } from '@/lib/utils/date'
import { CalendarIcon, Clock, Plus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { WorkoutCalendar } from './_components/workout-calendar'
import { getWorkoutsForUserOnDate } from '@/data/workouts'

interface DashboardPageProps {
  searchParams: Promise<{ date?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  // Get authenticated user
  const { userId } = await auth()

  if (!userId) {
    redirect('/sign-in')
  }

  // Get date from search params or use current date
  const params = await searchParams
  const dateParam = params.date
  let selectedDate: Date
  let startOfDay: Date
  let endOfDay: Date

  if (dateParam) {
    // Parse YYYY-MM-DD format in local timezone
    const [year, month, day] = dateParam.split('-').map(Number)
    if (year && month && day) {
      selectedDate = new Date(year, month - 1, day)
      startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
      endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)
    } else {
      // Invalid date format, use current date
      selectedDate = new Date()
      startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0)
      endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999)
    }
  } else {
    selectedDate = new Date()
    startOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 0, 0, 0, 0)
    endOfDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), 23, 59, 59, 999)
  }

  // Fetch workouts for the user on the selected date
  // This follows /docs/data-fetching.md guidelines:
  // - Data fetching ONLY in Server Component
  // - Using helper function from /data directory
  // - Helper function uses Drizzle ORM
  // - Filtered by userId for security
  const workouts = await getWorkoutsForUserOnDate(userId, startOfDay, endOfDay)

  const currentDate = new Date()

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your workout progress and manage your training schedule
          </p>
        </div>

        {/* Date Picker Section */}
        <WorkoutCalendar />

        {/* Workouts List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-semibold tracking-tight">
                Workouts for {formatDate(selectedDate)}
              </h2>
              <span className="text-sm text-muted-foreground">
                {workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'} found
              </span>
            </div>
            <Link href="/dashboard/workout/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Workout
              </Button>
            </Link>
          </div>

          {/* Empty State */}
          {workouts.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="rounded-full bg-muted p-4">
                  <CalendarIcon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No workouts scheduled</h3>
                <p className="mt-2 text-center text-sm text-muted-foreground">
                  There are no workouts scheduled for this date.
                  <br />
                  Try selecting a different date or create a new workout.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Workouts List */}
          {workouts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {workouts.map((workout) => {
                const duration = calculateDuration(workout.startedAt, workout.completedAt)
                const durationDisplay = workout.completedAt
                  ? formatDuration(duration)
                  : 'ongoing'

                return (
                  <Card key={workout.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{workout.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {formatTime(workout.startedAt)}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Start Time</span>
                        <span className="font-medium">{formatTime(workout.startedAt)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium capitalize">{durationDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Status</span>
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                            workout.completedAt === null
                              ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                              : workout.completedAt >= currentDate
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          )}
                        >
                          {workout.completedAt === null
                            ? 'Ongoing'
                            : workout.completedAt >= currentDate
                            ? 'Active'
                            : 'Completed'}
                        </span>
                      </div>
                      <div className="pt-4">
                        <Button variant="outline" className="w-full">
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
