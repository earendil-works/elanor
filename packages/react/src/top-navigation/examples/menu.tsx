import {Link, Text, TopNavigation} from '@earendil-works/elanor-react';
import {useRef} from 'react';

import styles from './menu.module.css';

const guides = ['Getting started', 'Deploying a project', 'Rollbacks'];
const reference = ['Command-line tool', 'Configuration file'];

export default function TopNavigationMenuDemo() {
  const frameRef = useRef<HTMLDivElement>(null);
  return (
    <div ref={frameRef} className={styles.frame}>
      <TopNavigation.Root className={styles.header}>
        <TopNavigation.Identity>
          <Link href="#">Acme</Link>
        </TopNavigation.Identity>
        <TopNavigation.Actions>
          <TopNavigation.Menu defaultPanel="main">
            <TopNavigation.MenuTrigger aria-label="Navigation menu" />
            <TopNavigation.MenuPopup aria-label="Navigation menu" container={frameRef}>
              <TopNavigation.MenuPanel panel="main">
                <TopNavigation.MenuList>
                  <TopNavigation.MenuItem>
                    <TopNavigation.MenuPanelTrigger panel="docs" active>
                      Docs
                    </TopNavigation.MenuPanelTrigger>
                  </TopNavigation.MenuItem>
                  <TopNavigation.MenuItem>
                    <TopNavigation.MenuLink href="#">Packages</TopNavigation.MenuLink>
                  </TopNavigation.MenuItem>
                  <TopNavigation.MenuItem>
                    <TopNavigation.MenuLink href="#">News</TopNavigation.MenuLink>
                  </TopNavigation.MenuItem>
                </TopNavigation.MenuList>
              </TopNavigation.MenuPanel>
              <TopNavigation.MenuPanel panel="docs" parent="main" backLabel="Main menu">
                <TopNavigation.MenuList>
                  <TopNavigation.MenuItem>
                    <TopNavigation.MenuLink href="#">Introduction</TopNavigation.MenuLink>
                  </TopNavigation.MenuItem>
                  <TopNavigation.MenuItem>
                    <TopNavigation.MenuCollapsible defaultOpen>
                      <TopNavigation.MenuCollapsibleTrigger>
                        Guides
                      </TopNavigation.MenuCollapsibleTrigger>
                      <TopNavigation.MenuCollapsiblePanel>
                        <TopNavigation.MenuList>
                          {guides.map((page) => (
                            <TopNavigation.MenuItem key={page}>
                              <TopNavigation.MenuLink href="#" active={page === 'Rollbacks'}>
                                {page}
                              </TopNavigation.MenuLink>
                            </TopNavigation.MenuItem>
                          ))}
                        </TopNavigation.MenuList>
                      </TopNavigation.MenuCollapsiblePanel>
                    </TopNavigation.MenuCollapsible>
                  </TopNavigation.MenuItem>
                  <TopNavigation.MenuItem>
                    <TopNavigation.MenuCollapsible>
                      <TopNavigation.MenuCollapsibleTrigger>
                        Reference
                      </TopNavigation.MenuCollapsibleTrigger>
                      <TopNavigation.MenuCollapsiblePanel>
                        <TopNavigation.MenuList>
                          {reference.map((page) => (
                            <TopNavigation.MenuItem key={page}>
                              <TopNavigation.MenuLink href="#">{page}</TopNavigation.MenuLink>
                            </TopNavigation.MenuItem>
                          ))}
                        </TopNavigation.MenuList>
                      </TopNavigation.MenuCollapsiblePanel>
                    </TopNavigation.MenuCollapsible>
                  </TopNavigation.MenuItem>
                </TopNavigation.MenuList>
              </TopNavigation.MenuPanel>
            </TopNavigation.MenuPopup>
          </TopNavigation.Menu>
        </TopNavigation.Actions>
      </TopNavigation.Root>
      <div className={styles.content}>
        <Text>Open the menu, then open Docs.</Text>
      </div>
    </div>
  );
}
