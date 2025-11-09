'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { updateWorkout, type UpdateWorkoutInput } from '../actions'
import { format } from 'date-fns'
import type { Workout } from '@/types/workout'

interface WorkoutEditDialogProps {
  workout: Workout
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WorkoutEditDialog({ workout, open, onOpenChange }: WorkoutEditDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isCompleted, setIsCompleted] = useState(!!workout.completedAt)

  // Format dates for form inputs
  const formatDateForInput = (date: Date) => format(date, 'yyyy-MM-dd')
  const formatTimeForInput = (date: Date) => format(date, 'HH:mm')

  const defaultStartDate = formatDateForInput(workout.startedAt)
  const defaultStartTime = formatTimeForInput(workout.startedAt)
  const defaultEndDate = workout.completedAt ? formatDateForInput(workout.completedAt) : formatDateForInput(new Date())
  const defaultEndTime = workout.completedAt ? formatTimeForInput(workout.completedAt) : formatTimeForInput(new Date())

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)

      // Extract form data
      const name = formData.get('name') as string
      const startDate = formData.get('startDate') as string
      const startTime = formData.get('startTime') as string
      const endDate = formData.get('endDate') as string
      const endTime = formData.get('endTime') as string

      // Combine date and time into ISO datetime strings
      const startedAt = `${startDate}T${startTime}:00`
      const completedAt = isCompleted && endDate && endTime
        ? `${endDate}T${endTime}:00`
        : null

      const input: UpdateWorkoutInput = {
        workoutId: workout.id,
        name,
        startedAt,
        completedAt,
      }

      const result = await updateWorkout(input)

      if (result.success) {
        onOpenChange(false)
        setError(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Workout</DialogTitle>
          <DialogDescription>
            Update the details of your workout session
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Workout Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="e.g., Morning Strength Training"
              defaultValue={workout.name}
              required
              disabled={isLoading}
              maxLength={255}
            />
          </div>

          {/* Start Date and Time */}
          <div className="space-y-2">
            <Label>Start Date & Time</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate" className="text-sm text-muted-foreground">
                  Date
                </Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  defaultValue={defaultStartDate}
                  required
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="startTime" className="text-sm text-muted-foreground">
                  Time
                </Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  defaultValue={defaultStartTime}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Completed Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isCompleted"
              checked={isCompleted}
              onCheckedChange={(checked) => setIsCompleted(checked === true)}
              disabled={isLoading}
            />
            <Label
              htmlFor="isCompleted"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mark as completed
            </Label>
          </div>

          {/* End Date and Time (conditional) */}
          {isCompleted && (
            <div className="space-y-2">
              <Label>End Date & Time</Label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="endDate" className="text-sm text-muted-foreground">
                    Date
                  </Label>
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    defaultValue={defaultEndDate}
                    required={isCompleted}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime" className="text-sm text-muted-foreground">
                    Time
                  </Label>
                  <Input
                    id="endTime"
                    name="endTime"
                    type="time"
                    defaultValue={defaultEndTime}
                    required={isCompleted}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Dialog Footer */}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Workout'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
