let apple: boolean | undefined;

/** Apple devices use Cmd where others use Ctrl. Reads `navigator`, so call it in the browser. */
export function isApple(): boolean {
  apple ??= /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
  return apple;
}
