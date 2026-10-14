import {Sidebar} from '@earendil-works/elanor-react';

import {WorkspaceSidebar} from './workspace-sidebar.tsx';

import styles from './sidebar.module.css';

export default function SidebarDemo() {
  return (
    <div className={styles.frame}>
      <Sidebar.Root className={styles.sidebar} render={<aside aria-label="Workspace sidebar" />}>
        {({collapsed}) => <WorkspaceSidebar collapsed={collapsed} />}
      </Sidebar.Root>
      <div className={styles.main}>
        Collapse the sidebar with the button next to the workspace name.
      </div>
    </div>
  );
}
