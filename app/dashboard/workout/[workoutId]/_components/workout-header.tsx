'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteWorkout, type DeleteWorkoutInput } from '../actions'
import { formatDate, formatTime, calculateDuration, formatDuration } from '@/lib/utils/date'
import { Pencil, Trash2, ArrowLeft } from 'lucide-react'
import { WorkoutEditDialog } from './workout-edit-dialog'
import type { Workout } from '@/types/workout'

interface WorkoutHeaderProps {
  workout: Workout
}

export function WorkoutHeader({ workout }: WorkoutHeaderProps) {
  const router = useRouter()
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleDelete() {
    setIsDeleting(true)
    setError(null)

    try {
      const input: DeleteWorkoutInput = {
        workoutId: workout.id,
      }

      const result = await deleteWorkout(input)

      if (result.success) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const duration = workout.completedAt
    ? calculateDuration(workout.startedAt, workout.completedAt)
    : null

  return (
    <>
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/dashboard')}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <CardTitle className="text-2xl">{workout.name}</CardTitle>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>
                  Started: {formatDate(workout.startedAt)} at {formatTime(workout.startedAt)}
                </div>
                {workout.completedAt && (
                  <div>
                    Completed: {formatDate(workout.completedAt)} at {formatTime(workout.completedAt)}
                  </div>
                )}
                {duration !== null && (
                  <div>Duration: {formatDuration(duration)}</div>
                )}
                {!workout.completedAt && (
                  <div className="text-blue-600 dark:text-blue-400 font-medium">
                    In Progress
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowEditDialog(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        {error && (
          <CardContent>
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Edit Dialog */}
      <WorkoutEditDialog
        workout={workout}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the workout "{workout.name}" and all its exercises and sets. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
