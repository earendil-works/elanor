import {AppearanceProvider} from '@earendil-works/elanor-react';
import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import '@earendil-works/elanor-strokes/pencil/radius.surface.css';

export const pencilSurfaceClassName = 'elanor-pencil-surface';
export const pencilIndicatorClassName = 'elanor-pencil-indicator';

export interface PencilAppearanceProps {
  readonly children?: ReactNode;
}

/** Optional Radius pencil skin. Scope follows React ancestry, including portals. */
export function PencilAppearance({children}: PencilAppearanceProps): React.JSX.Element {
  return <AppearanceProvider surfaceClassName={pencilSurfaceClassName} indicatorClassName={pencilIndicatorClassName}>{children}</AppearanceProvider>;
}

export interface PencilStrokeOutlineProps extends HTMLAttributes<HTMLDivElement> {
  /** Radius geometry from the matching token build. */
  readonly radius?: 'small' | 'medium' | 'large';
  readonly variant?: 0 | 1 | 2 | 3;
}

/**
 * A consumer-owned panel surface, not a descendant restyler.
 * Owns its fill and border; children are not automatically given the pencil skin.
 */
export const PencilStrokeOutline = forwardRef<HTMLDivElement, PencilStrokeOutlineProps>(
  function PencilStrokeOutline({radius = 'small', variant, className, ...props}, ref) {
    return (
      <div
        data-outline={`box-${radius}`}
        data-outline-focus="none"
        data-stroke-variant={variant}
        {...props}
        ref={ref}
        className={['elanor-pencil-wrapper', pencilSurfaceClassName, className].filter(Boolean).join(' ')}
      />
    );
  },
);
