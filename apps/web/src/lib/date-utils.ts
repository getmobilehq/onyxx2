/**
 * Date Formatting Utilities
 * Consistent date rendering across the app using native Intl APIs.
 */

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

const DIVISIONS: { amount: number; name: Intl.RelativeTimeFormatUnit }[] = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' },
];

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return dateFormatter.format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  return dateTimeFormatter.format(new Date(date));
}

export function formatRelative(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  let duration = (new Date(date).getTime() - Date.now()) / 1000;
  for (const division of DIVISIONS) {
    if (Math.abs(duration) < division.amount) {
      return rtf.format(Math.round(duration), division.name);
    }
    duration /= division.amount;
  }
  return formatDate(date);
}
