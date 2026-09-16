import * as React from 'react';
// Imported once, not composed into every CSS Module (which duplicates the bank
// and can leave asset URLs un-rebased in consumer bundlers).
import './generated/assets.css';

export type BrushVariant = 0 | 1 | 2 | 3 | 4 | 5;
export interface BrushProps {
  /** Fixed texture choice. Automatic variants are stable for a mounted component. */
  readonly brushVariant?: BrushVariant;
}

// React 17 remains supported: no global counters/randomness during SSR.
// Its deterministic fallback is variant zero; consumers can opt into variety
// explicitly. React 18+ gets hydration-safe automatic variation via useId.
const useStableId = React.useId ?? (() => '');
export function useBrushVariant(explicit?: BrushVariant): BrushVariant {
  const id = useStableId();
  let hash = 0;
  for (let index = 0; index < id.length; index++) hash = (Math.imul(hash, 31) + id.charCodeAt(index)) >>> 0;
  return explicit ?? (hash % 6 as BrushVariant);
}
