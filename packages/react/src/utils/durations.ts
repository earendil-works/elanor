/**
 * How long a confirmation stays, in milliseconds: the `semantic.duration.confirmation` token as
 * the element sees it, or 2000 when the token isn't loaded. CSS minifiers may write the value in
 * seconds (`2s`), so both units are read.
 */
export function readConfirmationDuration(element: Element): number {
  const value = getComputedStyle(element)
    .getPropertyValue('--semantic-duration-confirmation')
    .trim();
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 2000;
  return value.endsWith('ms') ? amount : amount * 1000;
}
