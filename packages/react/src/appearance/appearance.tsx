import {createContext, useContext, type ReactNode} from 'react';

const SurfaceClassNameContext = createContext<string | null>(null);
const IndicatorClassNameContext = createContext<string | null>(null);

export interface AppearanceProviderProps {
  /** A consumer-owned skin class applied to supported component surfaces. Null restores plain rendering. */
  readonly surfaceClassName?: string | null;
  /** Optional skin for default check/dash/dot indicators; custom indicator children are not restyled. */
  readonly indicatorClassName?: string | null;
  readonly children?: ReactNode;
}

/**
 * Supplies presentation, not brand tokens or application state. Nested providers
 * replace the class (they do not accumulate skins). React portals retain it;
 * independent React roots and detached trigger trees do not share it.
 */
export function AppearanceProvider({surfaceClassName = null, indicatorClassName = null, children}: AppearanceProviderProps): React.JSX.Element {
  return (
    <SurfaceClassNameContext.Provider value={surfaceClassName}>
      <IndicatorClassNameContext.Provider value={indicatorClassName}>{children}</IndicatorClassNameContext.Provider>
    </SurfaceClassNameContext.Provider>
  );
}

/** For component authors: apply to the visible surface, not necessarily the hit target. */
export function useSurfaceClassName(): string | null {
  return useContext(SurfaceClassNameContext);
}

/** For component authors: apply only to the default indicator, never caller-supplied content. */
export function useIndicatorClassName(): string | null {
  return useContext(IndicatorClassNameContext);
}
