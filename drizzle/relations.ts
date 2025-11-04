import { relations } from "drizzle-orm/relations";
import { workouts, workoutExercises, exercises, sets } from "./schema";

export const workoutExercisesRelations = relations(workoutExercises, ({one, many}) => ({
	workout: one(workouts, {
		fields: [workoutExercises.workoutId],
		references: [workouts.id]
	}),
	exercise: one(exercises, {
		fields: [workoutExercises.exerciseId],
		references: [exercises.id]
	}),
	sets: many(sets),
}));

export const workoutsRelations = relations(workouts, ({many}) => ({
	workoutExercises: many(workoutExercises),
}));

export const exercisesRelations = relations(exercises, ({many}) => ({
	workoutExercises: many(workoutExercises),
}));

export const setsRelations = relations(sets, ({one}) => ({
	workoutExercise: one(workoutExercises, {
		fields: [sets.workoutExerciseId],
		references: [workoutExercises.id]
	}),
}));