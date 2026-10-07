import {useRef, useState, type Ref, type UIEventHandler} from 'react';
import {HomeIcon, SettingsIcon} from '@earendil-works/elanor-icons-react';
import {Button} from '../button/button.tsx';
import {Checkbox} from '../checkbox/checkbox.tsx';
import {Layout} from '../layout/layout.tsx';
import {SideNavigation} from '../side-navigation/side-navigation.tsx';
import {Sidebar} from './sidebar.tsx';
import styles from './sidebar.example.module.css';

function ExampleContents({collapsed, homeRef, viewportRef, onScroll}: {
  collapsed: boolean;
  homeRef?: Ref<HTMLAnchorElement>;
  viewportRef?: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
}) {
  return (
    <>
      <Sidebar.Header>
        <Sidebar.Trigger />
        <a href="#sidebar-examples" aria-label="Acme workspace" className={styles.identity}>
          {collapsed ? 'A' : 'Acme workspace'}
        </a>
      </Sidebar.Header>
      <Sidebar.Content ref={viewportRef} onScroll={onScroll} role="region" aria-label="Workspace navigation scroll area">
        <SideNavigation.Root aria-label="Example workspace" variant={collapsed ? 'compact' : 'default'}>
          <SideNavigation.Group>
            <SideNavigation.GroupLabel>Workspace</SideNavigation.GroupLabel>
            <SideNavigation.List>
              <SideNavigation.Item>
                <SideNavigation.Link ref={homeRef} href="#sidebar-examples" active iconStart={<HomeIcon />}>
                  Home
                </SideNavigation.Link>
              </SideNavigation.Item>
              {Array.from({length: 12}, (_, index) => (
                <SideNavigation.Item key={index}>
                  <SideNavigation.Link href="#sidebar-examples" compactContent={String(index + 1)}>
                    {`Project ${index + 1} — a deliberately long destination label`}
                  </SideNavigation.Link>
                </SideNavigation.Item>
              ))}
              <SideNavigation.Item>
                <SideNavigation.Link href="#sidebar-examples" iconStart={<SettingsIcon />}>
                  Settings
                </SideNavigation.Link>
              </SideNavigation.Item>
            </SideNavigation.List>
          </SideNavigation.Group>
        </SideNavigation.Root>
      </Sidebar.Content>
      <Sidebar.Footer>
        <SideNavigation.Root aria-label="Example account" variant={collapsed ? 'compact' : 'default'}>
          <SideNavigation.List>
            <SideNavigation.Item>
              <SideNavigation.Link href="#sidebar-examples" compactContent="AB">
                Alexandra Brown — Platform Engineering and Operations
              </SideNavigation.Link>
            </SideNavigation.Item>
          </SideNavigation.List>
        </SideNavigation.Root>
      </Sidebar.Footer>
    </>
  );
}

export function SidebarExample() {
  return (
    <Layout.Root className={styles.frame} style={{minBlockSize: 0}}>
      <Layout.Body>
        <Sidebar.Root
          className={styles.sidebar}
          render={<Layout.Aside aria-label="Uncontrolled sidebar example" style={{position: 'static'}} />}
        >
          {({collapsed}) => <ExampleContents collapsed={collapsed} />}
        </Sidebar.Root>
        <Layout.Main render={<div />} className={styles.description}>
          <p>Local, uncontrolled state. Toggle the rail, then tab through its destinations.</p>
          <p>The long navigation scrolls internally; the toggle and account link stay available.</p>
          <p>Long account names truncate with an ellipsis without widening the footer.</p>
          <p>Hover or keyboard-focus compact links for supplementary labels. Expand the rail on touch to read all labels.</p>
        </Layout.Main>
      </Layout.Body>
    </Layout.Root>
  );
}

export function ControlledSidebarExample() {
  const [collapsed, setCollapsed] = useState(true);
  const [preventChanges, setPreventChanges] = useState(false);
  const [message, setMessage] = useState('Changes are allowed.');
  const homeRef = useRef<HTMLAnchorElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  return (
    <Layout.Root className={styles.frame} style={{minBlockSize: 0}}>
      <Layout.Body>
        <Sidebar.Root
          collapsed={collapsed}
          onCollapsedChange={(next, details) => {
            if (preventChanges) {
              details.cancel();
              setMessage('Change canceled. The sidebar kept its previous state.');
              return;
            }
            setCollapsed(next);
            setMessage(next ? 'Sidebar collapsed.' : 'Sidebar expanded.');
          }}
          className={styles.sidebar}
          render={<Layout.Aside aria-label="Controlled sidebar example" style={{position: 'static'}} />}
        >
          {({collapsed: current}) => (
            <ExampleContents
              collapsed={current}
              homeRef={homeRef}
              viewportRef={viewportRef}
              onScroll={(event) => setScrollTop(Math.round(event.currentTarget.scrollTop))}
            />
          )}
        </Sidebar.Root>
        <Layout.Main render={<div />} className={styles.description}>
          <p>Controlled state: {collapsed ? 'collapsed' : 'expanded'}.</p>
          <label className={styles.option}>
            <Checkbox.Root checked={preventChanges} onCheckedChange={setPreventChanges}>
              <Checkbox.Indicator />
            </Checkbox.Root>
            Cancel changes from the sidebar toggle
          </label>
          <p>Enable cancellation, then press the sidebar toggle. The callback calls details.cancel() without changing the owner's state.</p>
          <Button
            hierarchy="secondary"
            onClick={() => {
              // Focus the existing anchor BEFORE changing its presentation.
              homeRef.current?.focus();
              setCollapsed(current => !current);
              setMessage('Owner changed state; keyboard focus stays on the same Home link.');
            }}
          >
            Focus Home and toggle from owner
          </Button>
          <p>This owner action bypasses the toggle callback. The link stays focused and mounted in both presentations.</p>
          <Button hierarchy="secondary" onClick={() => {
            const viewport = viewportRef.current;
            viewport?.scrollTo({top: viewport.scrollHeight});
          }}>Scroll navigation to end</Button>
          <p>Content viewport scrollTop: {scrollTop}px. Header and account stay in place.</p>
          <p role="status">{message}</p>
        </Layout.Main>
      </Layout.Body>
    </Layout.Root>
  );
}
