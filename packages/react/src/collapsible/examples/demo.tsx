import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {Collapsible, Text} from '@earendil-works/elanor-react';

import styles from './collapsible.module.css';

export default function CollapsibleDemo() {
  return (
    <Collapsible.Root>
      <Collapsible.Trigger className={styles.trigger}>
        <KeyboardArrowDownIcon className={styles.chevron} />
        Recovery keys
      </Collapsible.Trigger>
      <Collapsible.Panel className={styles.panel}>
        <Text className={styles.content}>
          Store recovery keys somewhere safe. Each key works once.
        </Text>
      </Collapsible.Panel>
    </Collapsible.Root>
  );
}
