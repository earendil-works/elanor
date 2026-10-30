import {DarkModeIcon, LightModeIcon} from '@earendil-works/elanor-icons-boiled-react';
import {IconButton, TopNavigation} from '@earendil-works/elanor-react';

import styles from './color-scheme-toggle.module.css';

interface ColorSchemeToggleProps {
  readonly className?: string;
  /** `top-navigation` renders it as an action button of the top navigation. */
  readonly variant?: 'icon-button' | 'top-navigation';
}

/** Stateless: `scripts/color-scheme.ts` handles clicks and `aria-pressed`, so it needs no hydration. */
export function ColorSchemeToggle({
  className,
  variant = 'icon-button',
}: ColorSchemeToggleProps): React.JSX.Element {
  const Button = variant === 'top-navigation' ? TopNavigation.ActionButton : IconButton;
  return (
    <Button aria-label="Dark mode" className={className} data-color-scheme-toggle="">
      <DarkModeIcon className={styles.dark} />
      <LightModeIcon className={styles.light} />
    </Button>
  );
}
