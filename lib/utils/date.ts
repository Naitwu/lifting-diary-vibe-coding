import { format } from 'date-fns'

/**
 * Formats a date to the project standard: "1st Sep 2025"
 * @param date - Date object or timestamp
 * @returns Formatted date string (e.g., "1st Sep 2025")
 */
export function formatDate(date: Date | number): string {
  return format(date, 'do MMM yyyy')
}
