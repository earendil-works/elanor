/**
 * Formats a component directory name as its sentence-case display name.
 *
 * @param component The kebab-case component id, such as `scroll-area`.
 * @returns The display name used for navigation, page titles, and H1s, such as `Scroll area`.
 */
export function componentName(component: string): string {
  const name = component.replaceAll('-', ' ');
  return name.charAt(0).toUpperCase() + name.slice(1);
}
