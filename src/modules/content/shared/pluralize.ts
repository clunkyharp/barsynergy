/**
 * Russian pluralization helper.
 * Returns the count with the correct plural form.
 *
 * @example
 *   pluralize(1, ['программа', 'программы', 'программ']) // "1 программа"
 *   pluralize(3, ['программа', 'программы', 'программ']) // "3 программы"
 *   pluralize(10, ['программа', 'программы', 'программ']) // "10 программ"
 */
export function pluralize(count: number, forms: [string, string, string]): string {
  const n = Math.abs(count) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return `${count} ${forms[2]}`;
  if (n1 > 1 && n1 < 5) return `${count} ${forms[1]}`;
  if (n1 === 1) return `${count} ${forms[0]}`;
  return `${count} ${forms[2]}`;
}
