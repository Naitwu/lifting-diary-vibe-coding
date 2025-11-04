# Data Fetching Guidelines

## ⚠️ CRITICAL: Data Fetching Architecture

**ALL data fetching in this application MUST be performed exclusively through Server Components.**

### Mandatory Rules

1. **Server Components ONLY**
   - Data fetching MUST ONLY happen in Server Components
   - NEVER fetch data via Route Handlers (API routes)
   - NEVER fetch data via Client Components
   - NEVER use any other method for data fetching
   - This is non-negotiable and critical for security and architecture

2. **Database Queries via Helper Functions**
   - All database queries MUST go through helper functions in the `/data` directory
   - Helper functions MUST use Drizzle ORM for all database operations
   - NEVER use raw SQL queries
   - Helper functions should be well-typed and reusable

3. **User Data Isolation (CRITICAL SECURITY REQUIREMENT)**
   - Logged-in users MUST ONLY be able to query their own data
   - Users MUST NOT have access to any data belonging to other users
   - Every database query MUST filter by the authenticated user's ID
   - This is a critical security requirement and must be enforced in all helper functions

## Implementation Pattern

### Server Component Data Fetching

```tsx
// app/workouts/page.tsx
import { auth } from '@clerk/nextjs/server';
import { getWorkoutsForUser } from '@/data/workouts';

export default async function WorkoutsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  // Data fetching happens in Server Component
  const workouts = await getWorkoutsForUser(userId);

  return (
    <div>
      {/* Render workouts */}
    </div>
  );
}
```

### Helper Function Pattern

```typescript
// data/workouts.ts
import { db } from '@/db';
import { workouts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getWorkoutsForUser(userId: string) {
  // CRITICAL: Always filter by userId to ensure data isolation
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

## What NOT to Do

❌ **NEVER do this:**

```typescript
// ❌ WRONG: API Route Handler for data fetching
export async function GET(request: Request) {
  const workouts = await db.select().from(workouts);
  return Response.json(workouts);
}

// ❌ WRONG: Client Component with data fetching
'use client';
export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);

  useEffect(() => {
    fetch('/api/workouts').then(/* ... */);
  }, []);
}

// ❌ WRONG: Raw SQL query
const workouts = await db.execute(sql`SELECT * FROM workouts WHERE user_id = ${userId}`);

// ❌ WRONG: Missing user filter (SECURITY VIOLATION)
export async function getAllWorkouts() {
  return await db.select().from(workouts); // Missing userId filter!
}
```

✅ **ALWAYS do this:**

```typescript
// ✅ CORRECT: Server Component with helper function
export default async function WorkoutsPage() {
  const { userId } = await auth();
  const workouts = await getWorkoutsForUser(userId);
  return <div>{/* ... */}</div>;
}

// ✅ CORRECT: Helper function with Drizzle ORM and user filter
export async function getWorkoutsForUser(userId: string) {
  return await db
    .select()
    .from(workouts)
    .where(eq(workouts.userId, userId));
}
```

## Directory Structure

```
/data
  ├── workouts.ts      # Workout-related queries
  ├── exercises.ts     # Exercise-related queries
  ├── progress.ts      # Progress tracking queries
  └── ...
```

## Key Principles

1. **Security First**: User data isolation is paramount
2. **Type Safety**: Use Drizzle ORM for type-safe queries
3. **Server-Side Only**: All data fetching in Server Components
4. **Reusable Helpers**: Centralize queries in `/data` directory
5. **No Raw SQL**: Always use Drizzle ORM query builder

## Enforcement

- Every data fetching operation will be reviewed for compliance
- Any violation of these rules must be immediately corrected
- Security violations (missing user filters) are critical issues

**Remember: Server Components + /data helpers + Drizzle ORM + User filtering = The ONLY way to fetch data.**
