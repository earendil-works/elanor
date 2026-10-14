import {
  Button,
  Checkbox,
  Layout,
  SelectionControlAndLabel,
  Sidebar,
  Stack,
  Text,
} from '@earendil-works/elanor-react';
import {useState} from 'react';

import {WorkspaceSidebar} from './workspace-sidebar.tsx';

import styles from './sidebar.module.css';

export default function SidebarControlled() {
  const [collapsed, setCollapsed] = useState(false);
  const [locked, setLocked] = useState(false);
  const [message, setMessage] = useState('');

  return (
    <Layout.Root className={styles.frame} style={{minBlockSize: 0}}>
      <Layout.Body>
        <Sidebar.Root
          collapsed={collapsed}
          onCollapsedChange={(next, details) => {
            if (locked) {
              details.cancel();
              setMessage('Change canceled.');
              return;
            }
            setCollapsed(next);
            setMessage(next ? 'Sidebar collapsed.' : 'Sidebar expanded.');
          }}
          className={styles.sidebar}
          render={<Layout.Aside aria-label="Workspace sidebar" style={{position: 'static'}} />}
        >
          {({collapsed: current}) => <WorkspaceSidebar collapsed={current} />}
        </Sidebar.Root>
        <Layout.Main render={<div />} className={styles.main}>
          <Stack gap="medium">
            <Button hierarchy="secondary" onClick={() => setCollapsed(!collapsed)}>
              {collapsed ? 'Expand' : 'Collapse'} from outside
            </Button>
            <SelectionControlAndLabel
              control={
                <Checkbox.Root checked={locked} onCheckedChange={setLocked}>
                  <Checkbox.Indicator />
                </Checkbox.Root>
              }
            >
              Cancel changes from the sidebar button
            </SelectionControlAndLabel>
            <Text role="status">{message}</Text>
          </Stack>
        </Layout.Main>
      </Layout.Body>
    </Layout.Root>
  );
}
