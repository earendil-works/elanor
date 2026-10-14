export type StatefulClassName<State> = string | ((state: State) => string | undefined);

export function classes(...values: ReadonlyArray<string | false | null | undefined>): string {
  return values.filter((value): value is string => typeof value === 'string' && value.length > 0).join(' ');
}

const resolve = <State,>(className: StatefulClassName<State> | undefined, state: State) =>
  typeof className === 'function' ? className(state) : className;

export function mergeClassName<State>(
  componentClassName: StatefulClassName<State> | undefined,
  className: StatefulClassName<State> | undefined,
): StatefulClassName<State> | undefined {
  if (typeof componentClassName === 'function' || typeof className === 'function') {
    return (state) => classes(resolve(componentClassName, state), resolve(className, state));
  }
  return classes(componentClassName, className) || undefined;
}
