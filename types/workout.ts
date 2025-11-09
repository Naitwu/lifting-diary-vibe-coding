import { exercises, workouts, workoutExercises, sets } from "@/src/db/schema";

// Infer TypeScript types from Drizzle schema
export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;

export type WorkoutExercise = typeof workoutExercises.$inferSelect;
export type NewWorkoutExercise = typeof workoutExercises.$inferInsert;

export type Set = typeof sets.$inferSelect;
export type NewSet = typeof sets.$inferInsert;

// Composite types for queries with relations
export type WorkoutExerciseWithDetails = WorkoutExercise & {
  exercise: Exercise;
  sets: Set[];
};

export type WorkoutWithExercises = Workout & {
  workoutExercises: WorkoutExerciseWithDetails[];
};
