import {Link, Text, TopNavigation, TopNavigationMenu} from '@earendil-works/elanor-react';

import styles from './demo.module.css';

export default function TopNavigationMenuDemo() {
  return (
    <div className={styles.frame}>
      <TopNavigationMenu.Root defaultPanel="main">
        <TopNavigation.Root className={styles.header}>
          <TopNavigation.Identity>
            <Link href="#">Acme</Link>
          </TopNavigation.Identity>
          <TopNavigation.Actions>
            <TopNavigationMenu.Trigger aria-label="Navigation menu" />
          </TopNavigation.Actions>
        </TopNavigation.Root>
        <TopNavigationMenu.Popup>
          <TopNavigationMenu.Panel panel="main">
            <TopNavigationMenu.List>
              <TopNavigationMenu.Item>
                <TopNavigationMenu.Link href="#">Product</TopNavigationMenu.Link>
              </TopNavigationMenu.Item>
              <TopNavigationMenu.Item>
                <TopNavigationMenu.PanelTrigger panel="docs" active>
                  Docs
                </TopNavigationMenu.PanelTrigger>
              </TopNavigationMenu.Item>
              <TopNavigationMenu.Item>
                <TopNavigationMenu.Link href="#">Pricing</TopNavigationMenu.Link>
              </TopNavigationMenu.Item>
            </TopNavigationMenu.List>
          </TopNavigationMenu.Panel>
          <TopNavigationMenu.Panel panel="docs" parent="main" backLabel="Main menu">
            <TopNavigationMenu.List>
              <TopNavigationMenu.Item>
                <TopNavigationMenu.Link href="#">Getting started</TopNavigationMenu.Link>
              </TopNavigationMenu.Item>
              <TopNavigationMenu.Item>
                <TopNavigationMenu.Link href="#" active>
                  Deploying a project
                </TopNavigationMenu.Link>
              </TopNavigationMenu.Item>
              <TopNavigationMenu.Item>
                <TopNavigationMenu.Link href="#">Configuration</TopNavigationMenu.Link>
              </TopNavigationMenu.Item>
            </TopNavigationMenu.List>
          </TopNavigationMenu.Panel>
        </TopNavigationMenu.Popup>
      </TopNavigationMenu.Root>
      <div className={styles.content}>
        <Text>Open the menu, then open Docs.</Text>
      </div>
    </div>
  );
}
