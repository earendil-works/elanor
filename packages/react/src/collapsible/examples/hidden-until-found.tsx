import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {Collapsible, Text} from '@earendil-works/elanor-react';

import styles from './collapsible.module.css';

export default function CollapsibleHiddenUntilFoundDemo() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger className={styles.trigger}>
        <KeyboardArrowDownIcon className={styles.chevron} />
        Rollbacks
      </Collapsible.Trigger>
      <Collapsible.Panel hiddenUntilFound className={styles.panel}>
        <Text className={styles.content}>
          A deploy that fails its checks never replaces the running version.
        </Text>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
