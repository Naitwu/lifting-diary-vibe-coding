'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { AddExerciseDialog } from './add-exercise-dialog'
import type { Exercise } from '@/types/workout'

interface AddExerciseButtonProps {
  workoutId: number
  exercises: Exercise[]
}

export function AddExerciseButton({ workoutId, exercises }: AddExerciseButtonProps) {
  const [showDialog, setShowDialog] = useState(false)

  return (
    <>
      <Button onClick={() => setShowDialog(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Exercise
      </Button>
      <AddExerciseDialog
        workoutId={workoutId}
        exercises={exercises}
        open={showDialog}
        onOpenChange={setShowDialog}
      />
    </>
  )
}
