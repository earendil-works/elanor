import {CloseIcon, MenuIcon} from '@earendil-works/elanor-icons-boiled-react';
import {
  Drawer,
  IconButton,
  Stack,
  TopNavigation,
  type DrawerRootActions,
} from '@earendil-works/elanor-react';
import {useEffect, useRef} from 'react';

import type {SiteMark} from '../lib/site-mark.ts';
import {DocsSideNavigation, type DocsNavigationGroup} from './docs-side-navigation.tsx';
import {SiteIdentity} from './site-identity.tsx';

interface DocsMobileNavigationProps {
  readonly groups: readonly DocsNavigationGroup[];
  readonly current: string;
  readonly mark: SiteMark;
  /** Static HTML from Astro's `actions` slot, before the menu button. */
  readonly actions?: React.ReactNode;
}

export function DocsMobileNavigation({
  groups,
  current,
  mark,
  actions,
}: DocsMobileNavigationProps): React.JSX.Element {
  const actionsRef = useRef<DrawerRootActions>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // CSS owns the layout; this listener only releases the modal when desktop navigation returns.
    const breakpoint = getComputedStyle(document.documentElement).getPropertyValue(
      '--semantic-dimension-breakpoint-medium',
    );
    const desktop = window.matchMedia(`(width >= ${breakpoint.trim()})`);
    const close = () => actionsRef.current?.close();
    const onBreakpointChange = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener('change', onBreakpointChange);
    document.addEventListener('astro:before-preparation', close);
    return () => {
      desktop.removeEventListener('change', onBreakpointChange);
      document.removeEventListener('astro:before-preparation', close);
    };
  }, []);

  return (
    <Drawer.Root swipeDirection="left" actionsRef={actionsRef}>
      <TopNavigation.Root className="docs-mobile-header">
        <TopNavigation.Identity>
          <SiteIdentity mark={mark} data-astro-reload />
        </TopNavigation.Identity>
        <TopNavigation.Actions>
          {actions}
          <Drawer.Trigger ref={triggerRef} render={<IconButton aria-label="Open navigation" />}>
            <MenuIcon />
          </Drawer.Trigger>
        </TopNavigation.Actions>
      </TopNavigation.Root>
      <Drawer.Portal className="docs-navigation-layer">
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup
            finalFocus={() =>
              triggerRef.current?.getClientRects().length
                ? triggerRef.current
                : document.querySelector<HTMLAnchorElement>(
                    '[data-docs-swap="navigation"] a[aria-current="page"]',
                  )
            }
          >
            <Drawer.Content>
              <Stack gap="large" align="stretch">
                <Stack direction="row" align="center" gap="auto">
                  <Drawer.Title>Navigation</Drawer.Title>
                  <Drawer.Close render={<IconButton aria-label="Close navigation" />}>
                    <CloseIcon />
                  </Drawer.Close>
                </Stack>
                <DocsSideNavigation
                  groups={groups}
                  current={current}
                  onNavigate={() => actionsRef.current?.close()}
                />
              </Stack>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
