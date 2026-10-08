import {CloseIcon, MenuIcon} from '@earendil-works/elanor-icons-react';
import {
  Drawer,
  Heading,
  IconButton,
  Layout,
  Link,
  SideNavigation,
  Sidebar,
  Stack,
  Text,
  TopNavigation,
  type DrawerRootActions,
} from '@earendil-works/elanor-react';
import {useEffect, useRef, useState} from 'react';

import styles from './top-navigation.example.module.css';

const pages = ['Overview', 'Projects', 'Activity', 'Members', 'Usage', 'Billing', 'Settings'];

function Destinations({
  active,
  collapsed = false,
  onSelect,
}: {
  readonly active: string;
  readonly collapsed?: boolean;
  readonly onSelect: (page: string) => void;
}): React.JSX.Element {
  return (
    <SideNavigation.Root aria-label="Example workspace" variant={collapsed ? 'compact' : 'default'}>
      <SideNavigation.List>
        {pages.map((page) => (
          <SideNavigation.Item key={page}>
            <SideNavigation.Link
              href={`#${page.toLowerCase()}`}
              active={active === page}
              compactContent={page.slice(0, 2)}
              onClick={(event) => {
                // This demo selects local content; real applications supply their router links.
                event.preventDefault();
                onSelect(page);
              }}
            >
              {page}
            </SideNavigation.Link>
          </SideNavigation.Item>
        ))}
      </SideNavigation.List>
    </SideNavigation.Root>
  );
}

function Resources({onNavigate}: {readonly onNavigate?: () => void}): React.JSX.Element {
  return (
    <nav aria-label="Example resources" className={styles.links}>
      <Link href="/components/layout/" onClick={onNavigate}>
        Layout
      </Link>
      <Link href="/components/drawer/" onClick={onNavigate}>
        Drawer
      </Link>
    </nav>
  );
}

export function ResponsiveNavigationExample(): React.JSX.Element {
  const [active, setActive] = useState('Overview');
  const [collapsed, setCollapsed] = useState(false);
  const actionsRef = useRef<DrawerRootActions>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // CSS owns presentation. Only release the modal when its trigger becomes unavailable.
    const breakpoint = getComputedStyle(document.documentElement)
      .getPropertyValue('--semantic-dimension-breakpoint-medium')
      .trim();
    const desktop = window.matchMedia(`(min-width: ${breakpoint})`);
    const close = () => actionsRef.current?.close();
    const onBreakpointChange = () => {
      if (desktop.matches) close();
    };
    desktop.addEventListener('change', onBreakpointChange);
    return () => desktop.removeEventListener('change', onBreakpointChange);
  }, []);

  return (
    <Drawer.Root actionsRef={actionsRef} swipeDirection="left">
      <Layout.Root
        render={<section aria-label="Responsive navigation example" />}
        className={styles.application}
      >
        <Layout.Header render={<TopNavigation.Root />} className={styles.applicationHeader}>
          <TopNavigation.Identity>
            <Link href="/">Acme workspace</Link>
          </TopNavigation.Identity>
          <TopNavigation.Navigation className={styles.desktopOnly}>
            <Resources />
          </TopNavigation.Navigation>
          <TopNavigation.Actions className={styles.mobileOnly}>
            <Drawer.Trigger
              ref={triggerRef}
              render={<IconButton aria-label="Open workspace navigation" />}
            >
              <MenuIcon />
            </Drawer.Trigger>
          </TopNavigation.Actions>
        </Layout.Header>
        <Layout.Body className={styles.applicationBody}>
          <Sidebar.Root
            collapsed={collapsed}
            onCollapsedChange={setCollapsed}
            render={<Layout.Aside aria-label="Example desktop sidebar" />}
            className={styles.desktopSidebar}
          >
            <Sidebar.Header>
              <Sidebar.Trigger />
            </Sidebar.Header>
            <Sidebar.Content>
              <Destinations active={active} collapsed={collapsed} onSelect={setActive} />
            </Sidebar.Content>
          </Sidebar.Root>
          <Layout.Main render={<div />} ref={contentRef} tabIndex={-1} className={styles.content}>
            <Heading level={3}>{active}</Heading>
            <Text>Select a destination or resize the viewport. Desktop collapse is preserved.</Text>
          </Layout.Main>
        </Layout.Body>
      </Layout.Root>
      <Drawer.Portal className={styles.overlay}>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup
            finalFocus={() =>
              triggerRef.current?.getClientRects().length ? triggerRef.current : contentRef.current
            }
          >
            <Drawer.Content>
              <Stack align="stretch" gap="large">
                <Stack direction="row" align="center" gap="auto">
                  <Drawer.Title>Workspace navigation</Drawer.Title>
                  <Drawer.Close render={<IconButton aria-label="Close workspace navigation" />}>
                    <CloseIcon />
                  </Drawer.Close>
                </Stack>
                <Destinations
                  active={active}
                  onSelect={(page) => {
                    setActive(page);
                    actionsRef.current?.close();
                  }}
                />
                <Resources onNavigate={() => actionsRef.current?.close()} />
              </Stack>
            </Drawer.Content>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
