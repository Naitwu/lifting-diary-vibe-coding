# UI Guidelines

## Component Library

### shadcn/ui - MANDATORY

**CRITICAL RULE**: This project **EXCLUSIVELY** uses [shadcn/ui](https://ui.shadcn.com/) for all UI components.

#### Component Usage Policy

- ✅ **ALWAYS** use shadcn/ui components
- ❌ **NEVER** create custom components from scratch
- ❌ **NEVER** use other UI libraries (Material-UI, Ant Design, Chakra UI, etc.)
- ❌ **NEVER** build custom buttons, inputs, dialogs, or other UI primitives

#### Why shadcn/ui?

- Built on Radix UI primitives (accessibility-first)
- Fully customizable with Tailwind CSS
- Copy-paste components into your project (no package lock-in)
- TypeScript-first with excellent type safety
- Consistent with our Tailwind CSS v4 architecture

#### Adding shadcn/ui Components

When you need a new component:

```bash
# Install a specific component
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add select

# Components are installed to: components/ui/
```

#### Available Components

Refer to the [shadcn/ui documentation](https://ui.shadcn.com/docs/components) for the full list of available components:

- **Form Elements**: Button, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, etc.
- **Data Display**: Card, Table, Badge, Avatar, Tooltip, etc.
- **Feedback**: Alert, Dialog, Toast, Progress, Skeleton, etc.
- **Layout**: Tabs, Accordion, Separator, Sheet, etc.
- **Navigation**: Dropdown Menu, Context Menu, Navigation Menu, Breadcrumb, etc.

#### Component Composition

If you need a specialized component:

1. ✅ **Compose** existing shadcn/ui components together
2. ✅ **Extend** shadcn/ui components with additional props
3. ✅ **Wrap** shadcn/ui components with business logic
4. ❌ **DO NOT** build UI primitives from scratch

**Example - CORRECT Approach:**

```tsx
// ✅ Composing shadcn/ui components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function WorkoutCard({ title, exercises }: WorkoutCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {exercises.map(exercise => (
          <div key={exercise.id}>
            {exercise.name}
            <Button size="sm">Edit</Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**Example - INCORRECT Approach:**

```tsx
// ❌ DO NOT create custom UI primitives
export function CustomButton({ children }: CustomButtonProps) {
  return (
    <button className="px-4 py-2 rounded-md bg-blue-500">
      {children}
    </button>
  )
}
```

---

## Date Formatting

### date-fns - MANDATORY

**CRITICAL RULE**: All date formatting **MUST** use [date-fns](https://date-fns.org/).

#### Required Format

Dates must be displayed in the following format:

```
[ordinal day] [abbreviated month] [year]
```

**Examples:**
- `1st Sep 2025`
- `2nd Aug 2025`
- `3rd Jan 2026`
- `4th Jun 2024`
- `11th Mar 2024`
- `21st Dec 2025`
- `22nd Nov 2025`
- `23rd Oct 2024`

#### Implementation

Install date-fns if not already installed:

```bash
npm install date-fns
```

#### Date Formatting Function

Create a utility function for consistent date formatting:

```typescript
// lib/utils/date.ts or lib/date-utils.ts
import { format } from 'date-fns'

/**
 * Formats a date to the project standard: "1st Sep 2025"
 * @param date - Date object or timestamp
 * @returns Formatted date string (e.g., "1st Sep 2025")
 */
export function formatDate(date: Date | number): string {
  return format(date, 'do MMM yyyy')
}
```

#### Usage Examples

```typescript
import { formatDate } from '@/lib/utils/date'

// In a component
export function WorkoutLog({ date }: { date: Date }) {
  return (
    <div>
      <p>Workout Date: {formatDate(date)}</p>
    </div>
  )
}

// Examples:
formatDate(new Date(2025, 8, 1))  // "1st Sep 2025"
formatDate(new Date(2025, 7, 2))  // "2nd Aug 2025"
formatDate(new Date(2026, 0, 3))  // "3rd Jan 2026"
formatDate(new Date(2024, 5, 4))  // "4th Jun 2024"
```

#### date-fns Format Tokens

- `do` - Day of month with ordinal (1st, 2nd, 3rd, 4th, etc.)
- `MMM` - Abbreviated month name (Jan, Feb, Mar, etc.)
- `yyyy` - Full year (2024, 2025, etc.)

#### Other Date Operations

Use date-fns for ALL date operations:

```typescript
import {
  addDays,
  subDays,
  isAfter,
  isBefore,
  differenceInDays,
  startOfWeek,
  endOfWeek
} from 'date-fns'

// Add/subtract days
const tomorrow = addDays(new Date(), 1)
const yesterday = subDays(new Date(), 1)

// Compare dates
const isFuture = isAfter(someDate, new Date())

// Calculate differences
const daysBetween = differenceInDays(endDate, startDate)
```

---

## Styling System

### Tailwind CSS v4

- Use Tailwind utility classes for styling
- Custom CSS variables defined in `app/globals.css`
- Dark mode support via `prefers-color-scheme`

### Theming with CSS Variables

shadcn/ui components use CSS variables for theming. Customize in `app/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... other theme variables */
}
```

---

## Component Development Checklist

Before creating any component, ask yourself:

1. ✅ Does a shadcn/ui component exist for this? → **Use it**
2. ✅ Can I compose multiple shadcn/ui components? → **Compose them**
3. ✅ Can I extend a shadcn/ui component? → **Extend it**
4. ❌ Should I build a custom UI primitive? → **NO, never**

---

## Enforcement

- **Code Reviews**: All PRs must use shadcn/ui components
- **Linting**: Consider adding custom ESLint rules to prevent custom UI primitives
- **Documentation**: Link to this document in PR templates

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [shadcn/ui Components](https://ui.shadcn.com/docs/components)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [date-fns Documentation](https://date-fns.org/)
- [date-fns Format Reference](https://date-fns.org/docs/format)
