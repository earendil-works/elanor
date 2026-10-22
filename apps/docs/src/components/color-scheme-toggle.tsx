import {DarkModeIcon, LightModeIcon} from '@earendil-works/elanor-icons-boiled-react';
import {IconButton} from '@earendil-works/elanor-react';

import styles from './color-scheme-toggle.module.css';

interface ColorSchemeToggleProps {
  readonly className?: string;
}

/**
 * Switches between light and dark. Rendered without state: `src/scripts/color-scheme.ts`
 * handles clicks and sets `aria-pressed`, so the markup works with or without hydration.
 */
export function ColorSchemeToggle({className}: ColorSchemeToggleProps): React.JSX.Element {
  return (
    <IconButton aria-label="Dark mode" className={className} data-color-scheme-toggle="">
      <DarkModeIcon className={styles.dark} />
      <LightModeIcon className={styles.light} />
    </IconButton>
  );
}
