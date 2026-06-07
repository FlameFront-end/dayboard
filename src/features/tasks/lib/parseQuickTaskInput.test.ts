import { parseQuickTaskInput } from './parseQuickTaskInput';

describe('parseQuickTaskInput', () => {
  const today = new Date('2026-06-07T08:00:00');

  test('extracts time and title from hh:mm input', () => {
    const result = parseQuickTaskInput('09:30 English lesson', today);

    expect(result).toEqual({
      title: 'English lesson',
      time: '09:30',
      remindAt: '2026-06-07T09:30:00.000Z'
    });
  });

  test('normalizes single-digit hour', () => {
    const result = parseQuickTaskInput('9:30 English lesson', today);

    expect(result).toEqual({
      title: 'English lesson',
      time: '09:30',
      remindAt: '2026-06-07T09:30:00.000Z'
    });
  });

  test('does not treat bare hour as time', () => {
    const result = parseQuickTaskInput('18 English', today);

    expect(result).toEqual({
      title: '18 English'
    });
  });

  test('keeps invalid time as plain title', () => {
    const result = parseQuickTaskInput('25:99 Test', today);

    expect(result).toEqual({
      title: '25:99 Test'
    });
  });

  test('trims whitespace from untimed input', () => {
    const result = parseQuickTaskInput('   Write cover letter   ', today);

    expect(result).toEqual({
      title: 'Write cover letter'
    });
  });
});
