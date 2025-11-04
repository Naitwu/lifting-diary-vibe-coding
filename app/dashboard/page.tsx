'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatDate } from '@/lib/utils/date'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Mock workout data type (matching expected database schema)
interface Workout {
  id: string
  name: string
  startDate: Date
  endDate: Date | null
  userId: string
  createdAt: Date
  updatedAt: Date
}

// Mock data for UI demonstration
const mockWorkouts: Workout[] = [
  {
    id: '1',
    name: 'Upper Body Strength',
    startDate: new Date(2025, 10, 1), // Nov 1, 2025
    endDate: new Date(2025, 10, 30), // Nov 30, 2025
    userId: 'user1',
    createdAt: new Date(2025, 10, 1),
    updatedAt: new Date(2025, 10, 1),
  },
  {
    id: '2',
    name: 'Lower Body Power',
    startDate: new Date(2025, 9, 15), // Oct 15, 2025
    endDate: new Date(2025, 11, 15), // Dec 15, 2025
    userId: 'user1',
    createdAt: new Date(2025, 9, 15),
    updatedAt: new Date(2025, 9, 15),
  },
  {
    id: '3',
    name: 'Full Body Conditioning',
    startDate: new Date(2025, 10, 2), // Nov 2, 2025
    endDate: null, // Ongoing workout
    userId: 'user1',
    createdAt: new Date(2025, 10, 2),
    updatedAt: new Date(2025, 10, 2),
  },
]

export default function DashboardPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [currentDate, setCurrentDate] = useState<Date | undefined>(undefined)

  // Initialize dates on client side to avoid hydration mismatch
  useEffect(() => {
    const now = new Date()
    setSelectedDate(now)
    setCurrentDate(now)
  }, [])

  // Filter workouts that include the selected date
  // A workout includes a date if:
  // 1. startDate <= selectedDate
  // 2. endDate is null OR endDate >= selectedDate
  const filteredWorkouts = selectedDate ? mockWorkouts.filter((workout) => {
    const isAfterStart = workout.startDate <= selectedDate
    const isBeforeEnd = workout.endDate === null || workout.endDate >= selectedDate
    return isAfterStart && isBeforeEnd
  }) : []

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
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
            <CardDescription>
              Choose a date to view workouts scheduled for that day
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal md:w-[280px]',
                    !selectedDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? formatDate(selectedDate) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date)
                      setIsCalendarOpen(false)
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        {/* Workouts List Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold tracking-tight">
              Workouts for {selectedDate ? formatDate(selectedDate) : 'Loading...'}
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredWorkouts.length} {filteredWorkouts.length === 1 ? 'workout' : 'workouts'} found
            </span>
          </div>

          {/* Empty State */}
          {filteredWorkouts.length === 0 && (
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
          {filteredWorkouts.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredWorkouts.map((workout) => (
                <Card key={workout.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{workout.name}</CardTitle>
                    <CardDescription>
                      {formatDate(workout.startDate)} -{' '}
                      {workout.endDate ? formatDate(workout.endDate) : 'Ongoing'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Start Date</span>
                      <span className="font-medium">{formatDate(workout.startDate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">End Date</span>
                      <span className="font-medium">
                        {workout.endDate ? formatDate(workout.endDate) : 'Ongoing'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status</span>
                      <span
                        className={cn(
                          'inline-flex items-center rounded-full px-2 py-1 text-xs font-medium',
                          workout.endDate === null
                            ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                            : currentDate && workout.endDate >= currentDate
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                        )}
                      >
                        {workout.endDate === null
                          ? 'Ongoing'
                          : currentDate && workout.endDate >= currentDate
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
