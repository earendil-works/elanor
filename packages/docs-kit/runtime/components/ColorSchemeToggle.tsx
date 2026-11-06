/** @jsxImportSource react */
import {DarkModeIcon} from '@earendil-works/elanor-icons-react/dark-mode';
import {LightModeIcon} from '@earendil-works/elanor-icons-react/light-mode';
import {TopNavigation} from '@earendil-works/elanor-react';

/** Stateless: `scripts/color-scheme.ts` handles clicks and `aria-pressed`, so it needs no hydration. */
export function ColorSchemeToggle(): React.JSX.Element {
  return (
    <TopNavigation.ActionButton aria-label="Dark mode" data-color-scheme-toggle="">
      <DarkModeIcon className="docs-scheme-dark" />
      <LightModeIcon className="docs-scheme-light" />
    </TopNavigation.ActionButton>
  );
}
