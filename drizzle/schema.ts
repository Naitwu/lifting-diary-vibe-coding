import { pgTable, foreignKey, integer, timestamp, numeric, varchar, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const workoutExercises = pgTable("workout_exercises", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "workout_exercises_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	workoutId: integer("workout_id").notNull(),
	exerciseId: integer("exercise_id").notNull(),
	order: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.workoutId],
			foreignColumns: [workouts.id],
			name: "workout_exercises_workout_id_workouts_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.exerciseId],
			foreignColumns: [exercises.id],
			name: "workout_exercises_exercise_id_exercises_id_fk"
		}),
]);

export const sets = pgTable("sets", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "sets_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	workoutExerciseId: integer("workout_exercise_id").notNull(),
	setNumber: integer("set_number").notNull(),
	weightKg: numeric("weight_kg", { precision: 6, scale:  2 }).notNull(),
	reps: integer().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.workoutExerciseId],
			foreignColumns: [workoutExercises.id],
			name: "sets_workout_exercise_id_workout_exercises_id_fk"
		}).onDelete("cascade"),
]);

export const workouts = pgTable("workouts", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "workouts_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	userId: varchar("user_id", { length: 255 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	startedAt: timestamp("started_at", { mode: 'string' }).notNull(),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "exercises_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("exercises_name_unique").on(table.name),
]);
