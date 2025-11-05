# Authentication Guidelines

**⚠️ CRITICAL: ALL authentication-related code in this project MUST strictly follow the specifications defined in this document.**

## Authentication Provider

This project uses **Clerk** for user authentication and management.

**NEVER** implement custom authentication, use alternative auth providers, or bypass Clerk's authentication system.

## Core Requirements

### 1. Server-Side Authentication (REQUIRED)

**MUST** use Clerk's server-side authentication utilities for all protected routes and data access:

```typescript
import { auth } from '@clerk/nextjs/server';

// In Server Components or Server Actions
const { userId } = await auth();

if (!userId) {
  throw new Error('Unauthorized');
}
```

**NEVER** use client-side authentication checks for data security or authorization decisions.

### 2. User ID Security (CRITICAL)

**ALL database queries MUST be filtered by the authenticated user's ID:**

```typescript
// ✅ CORRECT - Filter by authenticated userId
const { userId } = await auth();
const workouts = await db.query.workouts.findMany({
  where: eq(workouts.userId, userId),
});

// ❌ WRONG - Missing userId filter (SECURITY VULNERABILITY)
const workouts = await db.query.workouts.findMany();
```

**This is a critical security requirement** - see `/docs/data-fetching.md` for detailed data access patterns.

### 3. Middleware Configuration

The project uses **`proxy.ts`** (not `middleware.ts`) for Next.js 16 compatibility:

```typescript
// proxy.ts
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
```

**NEVER** rename this file to `middleware.ts` or modify the matcher configuration without understanding the implications.

### 4. Protected Routes

Use Clerk's middleware to protect routes:

```typescript
// proxy.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/workouts(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});
```

### 5. UI Components

**MUST** use Clerk's pre-built components for authentication UI:

```typescript
import { SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

// ✅ CORRECT - Use Clerk components
<SignInButton mode="modal" />
<SignUpButton mode="modal" />
<UserButton afterSignOutUrl="/" />

// ❌ WRONG - Custom auth UI
<button onClick={customLogin}>Sign In</button>
```

### 6. Environment Variables

Required environment variables in `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

**NEVER** commit these values to version control. Get API keys from: https://dashboard.clerk.com/last-active?path=api-keys

## Server Actions

When creating Server Actions that modify data:

```typescript
'use server';

import { auth } from '@clerk/nextjs/server';
import { db } from '@/db';
import { workouts } from '@/db/schema';

export async function createWorkout(data: WorkoutData) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  // MUST include userId in insert
  return await db.insert(workouts).values({
    ...data,
    userId, // CRITICAL
  });
}
```

## Client Components

For client-side authentication state:

```typescript
'use client';

import { useUser, useAuth } from '@clerk/nextjs';

export function ClientComponent() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { getToken } = useAuth();

  // Check loading state
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Check authentication
  if (!isSignedIn) {
    return <div>Please sign in</div>;
  }

  return <div>Welcome, {user.firstName}</div>;
}
```

**IMPORTANT**: Client-side checks are for UI purposes only. **NEVER** rely on them for security or data access control.

## Organization Access

If using Clerk Organizations:

```typescript
import { auth } from '@clerk/nextjs/server';

const { userId, orgId } = await auth();

if (!orgId) {
  throw new Error('Organization required');
}
```

## Common Patterns

### 1. Getting User Metadata

```typescript
import { currentUser } from '@clerk/nextjs/server';

const user = await currentUser();

if (!user) {
  throw new Error('Unauthorized');
}

const email = user.emailAddresses[0]?.emailAddress;
const name = user.firstName + ' ' + user.lastName;
```

### 2. Webhook Validation

For Clerk webhooks (if implemented):

```typescript
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const webhook = new Webhook(WEBHOOK_SECRET);

  // Validate webhook
  const payload = await req.text();
  const headers = req.headers;

  webhook.verify(payload, {
    'svix-id': headers.get('svix-id')!,
    'svix-timestamp': headers.get('svix-timestamp')!,
    'svix-signature': headers.get('svix-signature')!,
  });

  // Process webhook...
}
```

## Security Checklist

Before deploying any authentication-related code, verify:

- [ ] All data queries are filtered by `userId`
- [ ] Server-side authentication checks are in place
- [ ] No sensitive operations rely on client-side auth state
- [ ] Environment variables are properly configured
- [ ] Clerk components are used for auth UI
- [ ] Protected routes are configured in `proxy.ts`
- [ ] No custom auth logic bypasses Clerk

## Prohibited Practices

**NEVER** do the following:

- ❌ Implement custom JWT validation
- ❌ Store passwords or credentials in the database
- ❌ Use `localStorage` or `cookies` for authentication state
- ❌ Bypass Clerk's authentication in Server Actions
- ❌ Expose user data without userId filtering
- ❌ Use client-side checks for authorization
- ❌ Implement custom session management

## Resources

- Clerk Documentation: https://clerk.com/docs
- Next.js Integration: https://clerk.com/docs/quickstarts/nextjs
- API Reference: https://clerk.com/docs/references/nextjs/overview
- Dashboard: https://dashboard.clerk.com

---

**ENFORCEMENT**: Non-compliance with these authentication guidelines poses critical security risks and is unacceptable. All authentication code must be reviewed against this document before deployment.
