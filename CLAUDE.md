# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application bootstrapped with `create-next-app`, configured with:
- **Framework**: Next.js 16.0.1 with App Router architecture
- **Language**: TypeScript 5 with strict mode enabled
- **Styling**: Tailwind CSS v4 with custom CSS variables and dark mode support
- **Fonts**: Geist Sans and Geist Mono (Google Fonts via next/font)
- **React**: Version 19.2.0
- **Authentication**: Clerk (user management and authentication)

## Development Commands

```bash
# Start development server (http://localhost:3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

## Architecture

### App Router Structure
- Uses Next.js App Router (`/app` directory)
- `app/layout.tsx`: Root layout with font configuration and metadata
- `app/page.tsx`: Home page component
- `app/globals.css`: Global styles with Tailwind imports and CSS variables

### TypeScript Configuration
- Path alias `@/*` maps to repository root for imports
- Target: ES2017 with modern module resolution (bundler)
- Strict mode enabled
- JSX set to `react-jsx`

### Styling System
- Tailwind CSS v4 with PostCSS
- CSS variables defined in `globals.css`:
  - `--background` and `--foreground` for theme colors
  - `--font-geist-sans` and `--font-geist-mono` for typography
- Dark mode using `prefers-color-scheme` media query
- Tailwind theme extended inline with custom color and font tokens

### Linting
- ESLint 9 with Next.js config (core-web-vitals + TypeScript rules)
- Configured via `eslint.config.mjs` using flat config format
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

### Authentication (Clerk)
- Uses `@clerk/nextjs` for user authentication and management
- `proxy.ts`: Middleware using `clerkMiddleware()` from `@clerk/nextjs/server` (Next.js 16 uses `proxy.ts` instead of `middleware.ts`)
- `app/layout.tsx`: Wrapped with `<ClerkProvider>` and includes auth UI components (`<SignInButton>`, `<SignUpButton>`, `<UserButton>`)
- Environment variables in `.env.local`:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Publishable API key
  - `CLERK_SECRET_KEY`: Secret API key
- Get API keys from: https://dashboard.clerk.com/last-active?path=api-keys

## Key Conventions

- All pages and components use TypeScript with `.tsx` extension
- Server Components by default (App Router behavior)
- CSS modules and Tailwind utility classes for styling
- Image optimization via `next/image` component
