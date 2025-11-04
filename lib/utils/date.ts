import { format, differenceInMinutes } from 'date-fns'

/**
 * Formats a date to the project standard: "1st Sep 2025"
 * @param date - Date object or timestamp
 * @returns Formatted date string (e.g., "1st Sep 2025")
 */
export function formatDate(date: Date | number): string {
  return format(date, 'do MMM yyyy')
}

/**
 * Formats a date to time format: "08:00 AM"
 * @param date - Date object or timestamp
 * @returns Formatted time string (e.g., "08:00 AM", "10:00 PM")
 */
export function formatTime(date: Date | number): string {
  return format(date, 'hh:mm a')
}

/**
 * Calculates duration between two dates in minutes
 * @param startDate - Start date
 * @param endDate - End date (optional, defaults to current time)
 * @returns Duration in minutes
 */
export function calculateDuration(startDate: Date, endDate?: Date | null): number {
  const end = endDate || new Date()
  return differenceInMinutes(end, startDate)
}

/**
 * Formats duration in minutes to a readable string
 * @param minutes - Duration in minutes
 * @returns Formatted duration string (e.g., "45 min", "1h 30min", "2h 15min")
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  return `${hours}h ${remainingMinutes}min`
}
