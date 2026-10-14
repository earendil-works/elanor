import {Layout, Sidebar} from '@earendil-works/elanor-react';

import {WorkspaceSidebar} from './workspace-sidebar.tsx';

import styles from './sidebar.module.css';

export default function SidebarDemo() {
  return (
    // minBlockSize: 0 and position: static fit the layout into this demo; omit them on a page.
    <Layout.Root className={styles.frame} style={{minBlockSize: 0}}>
      <Layout.Body>
        <Sidebar.Root
          className={styles.sidebar}
          render={<Layout.Aside aria-label="Workspace sidebar" style={{position: 'static'}} />}
        >
          {({collapsed}) => <WorkspaceSidebar collapsed={collapsed} />}
        </Sidebar.Root>
        <Layout.Main render={<div />} className={styles.main}>
          Collapse the sidebar with the button next to the workspace name.
        </Layout.Main>
      </Layout.Body>
    </Layout.Root>
  );
}
