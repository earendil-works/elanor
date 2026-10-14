import {
  AccountBalanceIcon,
  ArrowOutwardIcon,
  AttachMoneyIcon,
  AvgTimeIcon,
  CallSplitIcon,
  CardsStackIcon,
  ChatIcon,
  ContractIcon,
  DataExplorationIcon,
  DescriptionIcon,
  FinanceChipIcon,
  GroupsIcon,
  HomeIcon,
  KeyboardArrowDownIcon,
  KeyIcon,
  LogoutIcon,
  PerformanceMaxIcon,
  PersonIcon,
  RuleIcon,
  SettingsIcon,
  SmartToyIcon,
} from '@earendil-works/elanor-icons-react';
import {
  Button,
  Checkbox,
  Layout,
  ProjectSwitcher,
  Separator,
  SideNavigation,
  Stack,
  Sidebar,
} from '@earendil-works/elanor-react';
import {useRef, useState, type Ref, type UIEventHandler} from 'react';

import styles from './sidebar.example.module.css';

const navigationGroups = [
  {
    label: 'INSIGHTS',
    items: [
      {label: 'Explore', icon: <DataExplorationIcon />},
      {label: 'Sessions', icon: <ChatIcon />},
      {label: 'Spend', icon: <AttachMoneyIcon />},
      {label: 'Performance', icon: <PerformanceMaxIcon />},
      {label: 'Efficiency', icon: <AvgTimeIcon />},
    ],
  },
  {
    label: 'OPTIMIZE',
    items: [
      {label: 'Models', icon: <SmartToyIcon />},
      {label: 'Routing components', icon: <CallSplitIcon />},
      {label: 'Context components', icon: <RuleIcon />},
    ],
  },
  {
    label: 'MANAGE',
    items: [
      {label: 'Artifacts', icon: <CardsStackIcon />},
      {label: 'API keys', icon: <KeyIcon />},
      {label: 'Budgets', icon: <FinanceChipIcon />},
      {label: 'Billing', icon: <AccountBalanceIcon />},
      {label: 'Members', icon: <GroupsIcon />},
      {label: 'Settings', icon: <SettingsIcon />},
    ],
  },
];

function ExampleContents({
  collapsed,
  homeRef,
  viewportRef,
  onScroll,
}: {
  collapsed: boolean;
  homeRef?: Ref<HTMLAnchorElement>;
  viewportRef?: Ref<HTMLDivElement>;
  onScroll?: UIEventHandler<HTMLDivElement>;
}) {
  const [project, setProject] = useState('Earendil');
  const [activePage, setActivePage] = useState('Home');

  return (
    <>
      <Sidebar.Header>
        <Stack
          direction={collapsed ? 'column' : 'row'}
          gap={collapsed ? 'small' : 'auto'}
          align="center"
          className={styles.headerRow}
        >
          <a href="#sidebar-examples" aria-label="Acme workspace" className={styles.identity}>
            {collapsed ? 'A' : 'Acme workspace'}
          </a>
          <Sidebar.Trigger />
        </Stack>
        <ProjectSwitcher.Root>
          <ProjectSwitcher.Trigger
            aria-label={`Switch project, current project: ${project}`}
            className={styles.projectTrigger}
            data-collapsed={collapsed ? '' : undefined}
            indicator={collapsed ? null : <KeyboardArrowDownIcon aria-hidden="true" />}
          >
            {collapsed ? project[0] : project}
          </ProjectSwitcher.Trigger>
          <ProjectSwitcher.Portal>
            <ProjectSwitcher.Positioner align="start">
              <ProjectSwitcher.Popup>
                {['Earendil', 'Radius', 'Pi.dev'].map((name) => (
                  <ProjectSwitcher.Item key={name} onClick={() => setProject(name)}>
                    {name}
                  </ProjectSwitcher.Item>
                ))}
              </ProjectSwitcher.Popup>
            </ProjectSwitcher.Positioner>
          </ProjectSwitcher.Portal>
        </ProjectSwitcher.Root>
        <Separator />
      </Sidebar.Header>
      <Sidebar.Content
        ref={viewportRef}
        onScroll={onScroll}
        role="region"
        aria-label="Workspace navigation scroll area"
      >
        <SideNavigation.Root
          aria-label="Example workspace"
          variant={collapsed ? 'compact' : 'default'}
          className={styles.navigation}
        >
          <SideNavigation.List>
            <SideNavigation.Item>
              <SideNavigation.Link
                ref={homeRef}
                href="#sidebar-examples"
                iconStart={<HomeIcon />}
                active={activePage === 'Home'}
                onClick={(event) => {
                  event.preventDefault();
                  setActivePage('Home');
                }}
              >
                Home
              </SideNavigation.Link>
            </SideNavigation.Item>
          </SideNavigation.List>
          {navigationGroups.map((group) => (
            <SideNavigation.Group key={group.label}>
              <SideNavigation.GroupLabel>{group.label}</SideNavigation.GroupLabel>
              <SideNavigation.List>
                {group.items.map((item) => (
                  <SideNavigation.Item key={item.label}>
                    <SideNavigation.Link
                      href="#sidebar-examples"
                      iconStart={item.icon}
                      active={activePage === item.label}
                      onClick={(event) => {
                        event.preventDefault();
                        setActivePage(item.label);
                      }}
                    >
                      {item.label}
                    </SideNavigation.Link>
                  </SideNavigation.Item>
                ))}
              </SideNavigation.List>
            </SideNavigation.Group>
          ))}
        </SideNavigation.Root>
      </Sidebar.Content>
      <Sidebar.Footer>
        <Separator />
        <SideNavigation.Root
          aria-label="Example account"
          variant={collapsed ? 'compact' : 'default'}
        >
          <SideNavigation.List>
            <SideNavigation.Item>
              <SideNavigation.Link
                href="#sidebar-examples"
                iconStart={<DescriptionIcon />}
                iconEnd={<ArrowOutwardIcon />}
              >
                Documentation
              </SideNavigation.Link>
            </SideNavigation.Item>
            <SideNavigation.Item>
              <SideNavigation.Link
                href="#sidebar-examples"
                iconStart={<ContractIcon />}
                iconEnd={<ArrowOutwardIcon />}
              >
                Legal
              </SideNavigation.Link>
            </SideNavigation.Item>
            <SideNavigation.Item>
              <SideNavigation.Link href="#sidebar-examples" iconStart={<SettingsIcon />}>
                Account settings
              </SideNavigation.Link>
            </SideNavigation.Item>
            <SideNavigation.Item>
              <SideNavigation.Link
                href="#sidebar-examples"
                iconStart={<PersonIcon />}
                iconEnd={<LogoutIcon />}
              >
                alex@example.com
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
          render={
            <Layout.Aside aria-label="Uncontrolled sidebar example" style={{position: 'static'}} />
          }
        >
          {({collapsed}) => <ExampleContents collapsed={collapsed} />}
        </Sidebar.Root>
        <Layout.Main render={<div />} className={styles.description}>
          <p>The Radius sidebar layout, with text in place of the logo.</p>
          <p>
            Switch projects or collapse the sidebar. Header and footer stay in place while
            navigation scrolls.
          </p>
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
          render={
            <Layout.Aside aria-label="Controlled sidebar example" style={{position: 'static'}} />
          }
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
          <p>
            Enable cancellation, then press the sidebar toggle. The callback calls details.cancel()
            without changing the owner's state.
          </p>
          <Button
            hierarchy="secondary"
            onClick={() => {
              // Focus the existing anchor BEFORE changing its presentation.
              homeRef.current?.focus();
              setCollapsed((current) => !current);
              setMessage('Owner changed state; keyboard focus stays on the same Home link.');
            }}
          >
            Focus Home and toggle from owner
          </Button>
          <p>
            This owner action bypasses the toggle callback. The link stays focused and mounted in
            both presentations.
          </p>
          <Button
            hierarchy="secondary"
            onClick={() => {
              const viewport = viewportRef.current;
              viewport?.scrollTo({top: viewport.scrollHeight});
            }}
          >
            Scroll navigation to end
          </Button>
          <p>Content viewport scrollTop: {scrollTop}px. Header and account stay in place.</p>
          <p role="status">{message}</p>
        </Layout.Main>
      </Layout.Body>
    </Layout.Root>
  );
}
