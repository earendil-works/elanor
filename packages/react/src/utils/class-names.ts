export type StatefulClassName<State> = string | ((state: State) => string | undefined);

export function classes(...values: ReadonlyArray<string | false | null | undefined>): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}

export function mergeClassName<State>(
  componentClassName: string | undefined,
  className: StatefulClassName<State> | undefined,
): StatefulClassName<State> | undefined {
  if (typeof className === 'function') {
    return (state) => classes(componentClassName, className(state));
  }
  return classes(componentClassName, className) || undefined;
}
