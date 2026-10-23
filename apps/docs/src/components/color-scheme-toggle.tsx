import {DarkModeIcon, LightModeIcon} from '@earendil-works/elanor-icons-boiled-react';
import {IconButton} from '@earendil-works/elanor-react';

import styles from './color-scheme-toggle.module.css';

interface ColorSchemeToggleProps {
  readonly className?: string;
}

/** Stateless: `scripts/color-scheme.ts` handles clicks and `aria-pressed`, so it needs no hydration. */
export function ColorSchemeToggle({className}: ColorSchemeToggleProps): React.JSX.Element {
  return (
    <IconButton aria-label="Dark mode" className={className} data-color-scheme-toggle="">
      <DarkModeIcon className={styles.dark} />
      <LightModeIcon className={styles.light} />
    </IconButton>
  );
}
