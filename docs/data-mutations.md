# Data Mutations Guidelines

**⚠️ CRITICAL: ALL data mutation operations in this project MUST strictly follow the specifications defined in this document.**

## Core Principles

### 1. Mutation Layer Architecture (REQUIRED)

**ALL data mutations MUST go through helper functions in the `/data` directory:**

```typescript
// ✅ CORRECT - Use helper function from /data
import { createWorkout } from '@/data/workouts';

const workout = await createWorkout({
  name: 'Morning Session',
  date: new Date(),
});

// ❌ WRONG - Direct ORM calls outside /data directory
import { db } from '@/db';
import { workouts } from '@/db/schema';

const workout = await db.insert(workouts).values({ ... });
```

**ENFORCEMENT**: Direct Drizzle ORM calls are ONLY permitted inside helper functions within the `/data` directory. Any ORM usage outside this directory is a violation of this specification.

### 2. Helper Functions Location

All mutation helper functions MUST be organized in the `/data` directory:

```
/data
  ├── workouts.ts       # Workout-related mutations
  ├── exercises.ts      # Exercise-related mutations
  ├── sets.ts           # Set-related mutations
  └── ...               # Other entity mutations
```

### 3. Helper Function Structure

Each helper function MUST:
- Accept strongly-typed parameters
- Include userId for security (see `/docs/auth.md`)
- Use Drizzle ORM for database operations
- Return typed results
- Handle errors appropriately

```typescript
// /data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';

export async function createWorkout(data: {
  name: string;
  date: Date;
  notes?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      ...data,
      userId, // CRITICAL: Always include userId
    })
    .returning();

  return workout;
}

export async function updateWorkout(
  workoutId: string,
  data: {
    name?: string;
    date?: Date;
    notes?: string;
  }
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // CRITICAL: Filter by both workoutId AND userId
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)
    ))
    .returning();

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  return workout;
}

export async function deleteWorkout(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // CRITICAL: Filter by both workoutId AND userId
  const [deleted] = await db
    .delete(workouts)
    .where(and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)
    ))
    .returning();

  if (!deleted) {
    throw new Error('Workout not found or unauthorized');
  }

  return deleted;
}
```

## Server Actions

### 1. Colocation (REQUIRED)

**ALL Server Actions MUST be defined in `actions.ts` files colocated with their UI components:**

```
/app
  ├── dashboard
  │   ├── page.tsx
  │   └── actions.ts        # Server Actions for dashboard
  ├── workouts
  │   ├── [id]
  │   │   ├── page.tsx
  │   │   └── actions.ts    # Server Actions for workout detail
  │   └── create
  │       ├── page.tsx
  │       └── actions.ts    # Server Actions for workout creation
```

**NEVER** place Server Actions in:
- ❌ `/app/actions` (centralized directory)
- ❌ `/lib/actions` (shared directory)
- ❌ Component files (except for simple cases)
- ❌ API route handlers

### 2. Server Action Structure (REQUIRED)

Every Server Action MUST:
- Be marked with `'use server'` directive
- Accept strongly-typed parameters (NO FormData directly)
- Validate inputs using Zod
- Call helper functions from `/data` directory
- Handle errors and return typed results

```typescript
// app/workouts/create/actions.ts
'use server';

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

// Define Zod schema for validation
const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date: z.date(),
  notes: z.string().max(500).optional(),
});

// Infer TypeScript type from Zod schema
type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  // REQUIRED: Validate input with Zod
  const validatedData = createWorkoutSchema.parse(input);

  try {
    // REQUIRED: Use helper function from /data
    const workout = await createWorkout(validatedData);

    // Revalidate relevant paths
    revalidatePath('/dashboard');
    revalidatePath('/workouts');

    return { success: true, data: workout };
  } catch (error) {
    console.error('Failed to create workout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workout'
    };
  }
}
```

### 3. Input Validation with Zod (REQUIRED)

**ALL Server Actions MUST validate inputs using Zod schemas:**

```typescript
'use server';

import { z } from 'zod';

// ✅ CORRECT - Strongly typed with Zod validation
const updateWorkoutSchema = z.object({
  workoutId: z.string().uuid(),
  name: z.string().min(1).max(100).optional(),
  date: z.date().optional(),
  notes: z.string().max(500).optional(),
});

type UpdateWorkoutInput = z.infer<typeof updateWorkoutSchema>;

export async function updateWorkoutAction(input: UpdateWorkoutInput) {
  const validatedData = updateWorkoutSchema.parse(input);
  // ... rest of implementation
}

// ❌ WRONG - Using FormData directly
export async function updateWorkoutAction(formData: FormData) {
  const name = formData.get('name'); // Type is FormDataEntryValue | null
  // ... no validation, no type safety
}

// ❌ WRONG - No validation
export async function updateWorkoutAction(input: any) {
  // ... no validation
}
```

### 4. Form Handling Pattern

When working with forms, convert FormData to typed objects:

```typescript
// app/workouts/create/page.tsx
'use client';

import { createWorkoutAction } from './actions';

export default function CreateWorkoutPage() {
  async function handleSubmit(formData: FormData) {
    // Convert FormData to typed object
    const input = {
      name: formData.get('name') as string,
      date: new Date(formData.get('date') as string),
      notes: formData.get('notes') as string | undefined,
    };

    // Pass typed object to Server Action
    const result = await createWorkoutAction(input);

    if (result.success) {
      // Handle success
    } else {
      // Handle error
    }
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
    </form>
  );
}
```

### 5. Return Types (REQUIRED)

Server Actions MUST return consistent, typed results:

```typescript
// Define result types
type ActionSuccess<T> = {
  success: true;
  data: T;
};

type ActionError = {
  success: false;
  error: string;
};

type ActionResult<T> = ActionSuccess<T> | ActionError;

// Use in Server Actions
export async function createWorkoutAction(
  input: CreateWorkoutInput
): Promise<ActionResult<Workout>> {
  try {
    const workout = await createWorkout(validatedData);
    return { success: true, data: workout };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

### 6. Navigation and Redirects (REQUIRED)

**CRITICAL: Server Actions MUST NOT handle redirects. All navigation MUST be handled on the client side.**

```typescript
// ❌ WRONG - Using redirect() in Server Action
'use server';

import { redirect } from 'next/navigation';
import { createWorkout } from '@/data/workouts';

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const workout = await createWorkout(input);
  redirect('/dashboard'); // ❌ WRONG - Causes NEXT_REDIRECT error
}

// ✅ CORRECT - Return success result, let client handle redirect
'use server';

import { createWorkout } from '@/data/workouts';

export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    const workout = await createWorkout(input);
    return { success: true, data: workout }; // ✅ Return result
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workout'
    };
  }
}
```

Client-side component handles the redirect:

```typescript
// ✅ CORRECT - Client handles redirect after Server Action
'use client';

import { useRouter } from 'next/navigation';
import { createWorkoutAction } from './actions';

export function CreateWorkoutForm() {
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const input = {
      name: formData.get('name') as string,
      // ... other fields
    };

    const result = await createWorkoutAction(input);

    if (result.success) {
      router.push('/dashboard'); // ✅ Client-side redirect
    } else {
      // Handle error
    }
  }

  return <form action={handleSubmit}>{/* fields */}</form>;
}
```

**Why this is important:**
- ✅ Prevents `NEXT_REDIRECT` errors from flashing in the UI
- ✅ Clear separation of concerns (Server Action = data, Client = navigation)
- ✅ Better user experience with smooth transitions
- ✅ Easier to handle conditional navigation based on results
- ✅ Allows for loading states and error handling before redirect

## Complete Example

### Helper Function (`/data/workouts.ts`)

```typescript
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { auth } from '@clerk/nextjs/server';
import { eq, and } from 'drizzle-orm';

export async function createWorkout(data: {
  name: string;
  date: Date;
  notes?: string;
}) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [workout] = await db
    .insert(workouts)
    .values({
      ...data,
      userId,
    })
    .returning();

  return workout;
}
```

### Server Action (`/app/workouts/create/actions.ts`)

```typescript
'use server';

import { z } from 'zod';
import { createWorkout } from '@/data/workouts';
import { revalidatePath } from 'next/cache';

const createWorkoutSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  date: z.date(),
  notes: z.string().max(500).optional(),
});

type CreateWorkoutInput = z.infer<typeof createWorkoutSchema>;

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const validatedData = createWorkoutSchema.parse(input);

  try {
    const workout = await createWorkout(validatedData);
    revalidatePath('/dashboard');
    return { success: true, data: workout };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create workout'
    };
  }
}
```

### UI Component (`/app/workouts/create/page.tsx`)

```typescript
'use client';

import { createWorkoutAction } from './actions';
import { useState } from 'react';

export default function CreateWorkoutPage() {
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    const input = {
      name: formData.get('name') as string,
      date: new Date(formData.get('date') as string),
      notes: formData.get('notes') as string | undefined,
    };

    const result = await createWorkoutAction(input);

    if (result.success) {
      // Redirect or show success
    } else {
      setError(result.error);
    }
  }

  return (
    <form action={handleSubmit}>
      {/* form fields */}
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
```

## Security Requirements

### 1. Always Include userId

**CRITICAL**: All mutations MUST include userId filtering:

```typescript
// ✅ CORRECT - Includes userId
await db
  .update(workouts)
  .set(data)
  .where(and(
    eq(workouts.id, workoutId),
    eq(workouts.userId, userId)  // CRITICAL
  ));

// ❌ WRONG - Missing userId (SECURITY VULNERABILITY)
await db
  .update(workouts)
  .set(data)
  .where(eq(workouts.id, workoutId));
```

### 2. Validate Ownership

Always verify the authenticated user owns the resource:

```typescript
export async function updateWorkout(workoutId: string, data: UpdateData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // This query will fail if the workout doesn't belong to the user
  const [workout] = await db
    .update(workouts)
    .set(data)
    .where(and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)
    ))
    .returning();

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  return workout;
}
```

## Common Patterns

### 1. Bulk Operations

```typescript
export async function createMultipleSets(
  workoutId: string,
  sets: Array<{ exerciseId: string; reps: number; weight: number }>
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // Verify workout ownership first
  const workout = await db.query.workouts.findFirst({
    where: and(
      eq(workouts.id, workoutId),
      eq(workouts.userId, userId)
    ),
  });

  if (!workout) {
    throw new Error('Workout not found or unauthorized');
  }

  // Perform bulk insert
  const createdSets = await db
    .insert(setsTable)
    .values(
      sets.map(set => ({
        ...set,
        workoutId,
        userId,
      }))
    )
    .returning();

  return createdSets;
}
```

### 2. Transactions

```typescript
import { db } from '@/db';

export async function duplicateWorkout(workoutId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return await db.transaction(async (tx) => {
    // Get original workout
    const original = await tx.query.workouts.findFirst({
      where: and(
        eq(workouts.id, workoutId),
        eq(workouts.userId, userId)
      ),
      with: {
        exercises: true,
      },
    });

    if (!original) {
      throw new Error('Workout not found');
    }

    // Create duplicate workout
    const [newWorkout] = await tx
      .insert(workouts)
      .values({
        name: `${original.name} (Copy)`,
        date: new Date(),
        userId,
      })
      .returning();

    // Duplicate exercises
    if (original.exercises.length > 0) {
      await tx.insert(exercises).values(
        original.exercises.map(ex => ({
          workoutId: newWorkout.id,
          name: ex.name,
          userId,
        }))
      );
    }

    return newWorkout;
  });
}
```

## Cache Revalidation

Always revalidate relevant paths after mutations:

```typescript
import { revalidatePath } from 'next/cache';

export async function createWorkoutAction(input: CreateWorkoutInput) {
  const workout = await createWorkout(input);

  // Revalidate all affected paths
  revalidatePath('/dashboard');
  revalidatePath('/workouts');
  revalidatePath(`/workouts/${workout.id}`);

  return { success: true, data: workout };
}
```

## Error Handling

```typescript
export async function createWorkoutAction(input: CreateWorkoutInput) {
  try {
    // Validate with Zod
    const validatedData = createWorkoutSchema.parse(input);

    // Call helper function
    const workout = await createWorkout(validatedData);

    // Revalidate
    revalidatePath('/dashboard');

    return { success: true, data: workout };
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || 'Validation failed'
      };
    }

    // Handle other errors
    console.error('Failed to create workout:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
```

## Prohibited Practices

**NEVER** do the following:

- ❌ Use Drizzle ORM directly outside `/data` directory
- ❌ Accept FormData directly in Server Actions
- ❌ Skip Zod validation
- ❌ Use untyped parameters (`any`, `unknown`)
- ❌ Place Server Actions in centralized directories
- ❌ Perform mutations without userId filtering
- ❌ Use API Route Handlers for mutations (use Server Actions)
- ❌ Skip error handling
- ❌ Forget to revalidate cache
- ❌ Use `redirect()` in Server Actions (handle navigation on client side)

## Security Checklist

Before deploying any mutation code, verify:

- [ ] Helper functions are in `/data` directory
- [ ] No direct ORM calls outside `/data`
- [ ] Server Actions are colocated with UI components
- [ ] All inputs are validated with Zod
- [ ] All parameters are strongly typed
- [ ] userId is included in all mutations
- [ ] Ownership is verified for updates/deletes
- [ ] Errors are handled appropriately
- [ ] Cache is revalidated after mutations
- [ ] Return types are consistent and typed
- [ ] Navigation/redirects are handled on client side (NOT in Server Actions)

## Related Documentation

- `/docs/auth.md` - Authentication requirements
- `/docs/data-fetching.md` - Data fetching patterns
- `/docs/ui.md` - UI component guidelines

---

**ENFORCEMENT**: Non-compliance with these data mutation guidelines poses critical security risks and violates the project's architectural standards. All mutation code must be reviewed against this document before deployment.
