# Routing Standards

This document defines the routing architecture and protection requirements for this Next.js application.

## Route Structure

**ALL application routes MUST go through `/dashboard`**

- Primary application interface: `/dashboard`
- All feature pages MUST be nested under `/dashboard` (e.g., `/dashboard/workout`, `/dashboard/settings`)
- Public routes (landing page, marketing pages) remain at root level

## Route Protection (CRITICAL)

**`/dashboard` and ALL its sub-routes MUST be protected routes**

### Requirements

1. **Authentication Enforcement**: Only authenticated users can access `/dashboard` and its children
2. **Implementation Method**: Route protection MUST be implemented in Next.js middleware (`proxy.ts` for Next.js 16)
3. **Redirect Behavior**: Unauthenticated users attempting to access protected routes MUST be redirected to sign-in

### Middleware Implementation

Using Clerk's `clerkMiddleware()` in `proxy.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

### Key Points

- **Server-side protection**: Route guards execute on the server before page renders
- **Security-first**: Client-side checks are NOT sufficient for route protection
- **Consistent enforcement**: ALL `/dashboard/*` routes protected automatically via matcher pattern
- **No manual checks**: Individual pages do NOT need to implement their own auth checks (middleware handles it)

## Route Organization

### Protected Routes (under `/dashboard`)

```
/dashboard              # Main dashboard (workouts overview, calendar)
/dashboard/workout/new  # Create new workout
/dashboard/workout/[id] # View/edit specific workout
/dashboard/settings     # User settings
/dashboard/stats        # Statistics and analytics
```

### Public Routes (root level)

```
/                       # Landing page (marketing)
/about                  # About page
/pricing                # Pricing information
```

## Navigation Guidelines

1. **Authenticated users**: Always redirect to `/dashboard` after sign-in
2. **Post-authentication flow**: Use Clerk's environment variables to configure redirect URLs:
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard`
   - `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard`
3. **Links within app**: Use Next.js `<Link>` component for client-side navigation
4. **Deep linking**: Protected routes can be deep-linked; middleware will handle auth redirect

## Security Requirements

- **NEVER bypass middleware protection**: Do not create alternative access patterns to `/dashboard` routes
- **NEVER rely solely on client-side auth checks**: Middleware protection is mandatory
- **ALWAYS assume middleware handles protection**: Pages under `/dashboard` should focus on functionality, not auth checks

## Enforcement

Before creating any new route:
1. Determine if it requires authentication
2. If YES: Place under `/dashboard` (automatic protection via middleware)
3. If NO: Place at root level (public access)
4. Verify middleware matcher pattern includes the new route
