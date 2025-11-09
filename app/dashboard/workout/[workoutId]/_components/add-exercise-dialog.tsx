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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { addExercise, type AddExerciseInput } from '../actions'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Exercise } from '@/types/workout'

interface AddExerciseDialogProps {
  workoutId: number
  exercises: Exercise[]
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddExerciseDialog({ workoutId, exercises, open, onOpenChange }: AddExerciseDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedExercise, setSelectedExercise] = useState<string>('')
  const [searchValue, setSearchValue] = useState('')

  async function handleAdd() {
    if (!selectedExercise && !searchValue) {
      setError('Please select or enter an exercise name')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const exerciseName = selectedExercise || searchValue

      const input: AddExerciseInput = {
        workoutId,
        exerciseName,
      }

      const result = await addExercise(input)

      if (result.success) {
        // Reset form
        setSelectedExercise('')
        setSearchValue('')
        setError(null)
        onOpenChange(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setSelectedExercise('')
      setSearchValue('')
      setError(null)
    }
    onOpenChange(open)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Exercise</DialogTitle>
          <DialogDescription>
            Search for an exercise or type a custom name
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Command className="border rounded-lg">
            <CommandInput
              placeholder="Search exercises or type custom name..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>
                {searchValue ? (
                  <div className="py-6 text-center text-sm">
                    <p className="text-muted-foreground">No exercise found</p>
                    <p className="mt-2">Press "Add Exercise" to create "{searchValue}"</p>
                  </div>
                ) : (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    Start typing to search or create an exercise
                  </p>
                )}
              </CommandEmpty>
              <CommandGroup heading="Exercises">
                {exercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={(value) => {
                      setSelectedExercise(value === selectedExercise ? '' : value)
                      setSearchValue(value)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        selectedExercise === exercise.name ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>

          {/* Error Message */}
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleAdd}
            disabled={isLoading || (!selectedExercise && !searchValue)}
          >
            {isLoading ? 'Adding...' : 'Add Exercise'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
