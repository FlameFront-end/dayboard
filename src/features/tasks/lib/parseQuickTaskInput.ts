const TIME_PREFIX_PATTERN = /^(\d{1,2}):(\d{2})\s+(.+)$/;

function toIsoAtLocalTime(date: Date, hours: number, minutes: number): string {
  const reminderDate = new Date(date);
  reminderDate.setHours(hours, minutes, 0, 0);
  return reminderDate.toISOString();
}

export function parseQuickTaskInput(input: string, date: Date): {
  title: string;
  time?: string;
  remindAt?: string;
} {
  const trimmedInput = input.trim();
  const match = TIME_PREFIX_PATTERN.exec(trimmedInput);

  if (!match) {
    return { title: trimmedInput };
  }

  const [, rawHours, rawMinutes, rawTitle] = match;
  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);

  if (hours > 23 || minutes > 59) {
    return { title: trimmedInput };
  }

  const normalizedTime = `${String(hours).padStart(2, '0')}:${rawMinutes}`;

  return {
    title: rawTitle.trim(),
    time: normalizedTime,
    remindAt: toIsoAtLocalTime(date, hours, minutes)
  };
}
