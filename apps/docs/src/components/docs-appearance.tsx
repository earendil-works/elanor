import {AppearanceProvider, useIndicatorClassName, useSurfaceClassName} from '@earendil-works/elanor-react';
import {PencilAppearance} from '@earendil-works/elanor-strokes-react';
import {useEffect, useState, type ReactNode} from 'react';

/** Each Astro island is a separate React tree. Bridge the docs-only DOM toggle here. */
export function DocsAppearance({children}: {children: ReactNode}): React.JSX.Element {
  return <PencilAppearance><DocsAppearanceSelection>{children}</DocsAppearanceSelection></PencilAppearance>;
}

function DocsAppearanceSelection({children}: {children: ReactNode}): React.JSX.Element {
  const surfaceClassName = useSurfaceClassName();
  const indicatorClassName = useIndicatorClassName();
  const [pencil, setPencil] = useState(false);
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setPencil(root.dataset.strokes === 'pencil');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, {attributes: true, attributeFilter: ['data-strokes']});
    return () => observer.disconnect();
  }, []);
  // Mask the consumer skin with neutral values instead of switching provider trees:
  // toggling appearance must not remount demos or discard input/selection state.
  return (
    <AppearanceProvider
      surfaceClassName={pencil ? surfaceClassName : null}
      indicatorClassName={pencil ? indicatorClassName : null}
    >
      {children}
    </AppearanceProvider>
  );
}
