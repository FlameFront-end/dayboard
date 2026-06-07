import { addDays, format, isToday, isTomorrow, parseISO } from 'date-fns';

export function formatLocalDate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function toTomorrowDate(date: string): string {
  return formatLocalDate(addDays(parseISO(`${date}T00:00:00.000Z`), 1));
}

export function formatSelectedDateLabel(date: string): string {
  const parsedDate = parseISO(`${date}T00:00:00.000Z`);

  if (isToday(parsedDate)) {
    return 'Today';
  }

  if (isTomorrow(parsedDate)) {
    return 'Tomorrow';
  }

  return format(parsedDate, 'EEE, MMM d');
}

export function isPastLocalDate(date: string, today: string): boolean {
  return date < today;
}
