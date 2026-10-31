/** Words that keep their capitals in display names, by their kebab-case form. */
const acronyms = new Map([['otp', 'OTP']]);

/**
 * Formats a component directory name as its sentence-case display name.
 *
 * @param component The kebab-case component id, such as `scroll-area`.
 * @returns The display name used for navigation, page titles, and H1s, such as `Scroll area`.
 */
export function componentName(component: string): string {
  const name = component
    .split('-')
    .map((word) => acronyms.get(word) ?? word)
    .join(' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}

/**
 * Formats a kebab-case name as Base UI's PascalCase export name.
 *
 * @param name A kebab-case id, such as `otp-field`.
 * @returns The PascalCase name, such as `OTPField`.
 */
export function pascalName(name: string): string {
  return name
    .split('-')
    .map((word) => acronyms.get(word) ?? word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}
