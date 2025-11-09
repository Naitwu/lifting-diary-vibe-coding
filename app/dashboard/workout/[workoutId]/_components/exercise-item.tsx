'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  removeExercise,
  logSet,
  updateSetAction,
  deleteSetAction,
  type RemoveExerciseInput,
  type LogSetInput,
  type UpdateSetInput,
  type DeleteSetInput,
} from '../actions'
import { Plus, Trash2, Pencil, Check, X } from 'lucide-react'
import type { WorkoutExerciseWithDetails } from '@/types/workout'

interface ExerciseItemProps {
  workoutExercise: WorkoutExerciseWithDetails
  workoutId: number
}

export function ExerciseItem({ workoutExercise, workoutId }: ExerciseItemProps) {
  const [isLoggingSet, setIsLoggingSet] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showRemoveDialog, setShowRemoveDialog] = useState(false)
  const [editingSetId, setEditingSetId] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editReps, setEditReps] = useState('')
  const [deletingSetId, setDeletingSetId] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  const nextSetNumber = workoutExercise.sets.length + 1

  async function handleLogSet(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(event.currentTarget)
      const weightKg = formData.get('weight') as string
      const reps = parseInt(formData.get('reps') as string, 10)

      const input: LogSetInput = {
        workoutExerciseId: workoutExercise.id,
        setNumber: nextSetNumber,
        weightKg,
        reps,
        workoutId,
      }

      const result = await logSet(input)

      if (result.success) {
        // Reset form
        formRef.current?.reset()
        setIsLoggingSet(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemoveExercise() {
    setIsLoading(true)
    setError(null)

    try {
      const input: RemoveExerciseInput = {
        workoutExerciseId: workoutExercise.id,
        workoutId,
      }

      const result = await removeExercise(input)

      if (result.success) {
        setShowRemoveDialog(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setShowRemoveDialog(false)
    } finally {
      setIsLoading(false)
    }
  }

  function startEditSet(setId: number, weight: string, reps: number) {
    setEditingSetId(setId)
    setEditWeight(weight)
    setEditReps(reps.toString())
  }

  function cancelEditSet() {
    setEditingSetId(null)
    setEditWeight('')
    setEditReps('')
  }

  async function saveEditSet(setId: number) {
    setIsLoading(true)
    setError(null)

    try {
      const input: UpdateSetInput = {
        setId,
        weightKg: editWeight,
        reps: parseInt(editReps, 10),
        workoutId,
      }

      const result = await updateSetAction(input)

      if (result.success) {
        setEditingSetId(null)
        setEditWeight('')
        setEditReps('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDeleteSet(setId: number) {
    setIsLoading(true)
    setError(null)

    try {
      const input: DeleteSetInput = {
        setId,
        workoutId,
      }

      const result = await deleteSetAction(input)

      if (result.success) {
        setDeletingSetId(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setDeletingSetId(null)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">{workoutExercise.exercise.name}</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRemoveDialog(true)}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Sets Table */}
          {workoutExercise.sets.length > 0 && (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-20">Set</TableHead>
                    <TableHead>Weight (kg)</TableHead>
                    <TableHead>Reps</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workoutExercise.sets.map((set) => (
                    <TableRow key={set.id}>
                      <TableCell className="font-medium">{set.setNumber}</TableCell>
                      <TableCell>
                        {editingSetId === set.id ? (
                          <Input
                            type="number"
                            step="0.25"
                            min="0"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            className="w-24"
                            disabled={isLoading}
                          />
                        ) : (
                          set.weightKg
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSetId === set.id ? (
                          <Input
                            type="number"
                            min="1"
                            value={editReps}
                            onChange={(e) => setEditReps(e.target.value)}
                            className="w-20"
                            disabled={isLoading}
                          />
                        ) : (
                          set.reps
                        )}
                      </TableCell>
                      <TableCell>
                        {editingSetId === set.id ? (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => saveEditSet(set.id)}
                              disabled={isLoading}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={cancelEditSet}
                              disabled={isLoading}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => startEditSet(set.id, set.weightKg, set.reps)}
                              disabled={isLoading}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeletingSetId(set.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Empty State */}
          {workoutExercise.sets.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No sets logged yet. Click "Log Set" to add your first set.
            </p>
          )}

          {/* Log Set Form */}
          {isLoggingSet ? (
            <form ref={formRef} onSubmit={handleLogSet} className="space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`weight-${workoutExercise.id}`}>
                    Weight (kg)
                  </Label>
                  <Input
                    id={`weight-${workoutExercise.id}`}
                    name="weight"
                    type="number"
                    step="0.25"
                    min="0"
                    placeholder="0"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`reps-${workoutExercise.id}`}>
                    Reps
                  </Label>
                  <Input
                    id={`reps-${workoutExercise.id}`}
                    name="reps"
                    type="number"
                    min="1"
                    placeholder="0"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? 'Logging...' : `Log Set ${nextSetNumber}`}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsLoggingSet(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsLoggingSet(true)}
              disabled={isLoading}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Set {nextSetNumber}
            </Button>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remove Exercise Confirmation Dialog */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove exercise?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove "{workoutExercise.exercise.name}" and all its sets from this workout. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveExercise}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Set Confirmation Dialog */}
      <AlertDialog open={deletingSetId !== null} onOpenChange={(open) => !open && setDeletingSetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete set?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this set. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingSetId && handleDeleteSet(deletingSetId)}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
