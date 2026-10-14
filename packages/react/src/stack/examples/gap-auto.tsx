import {Stack, Text} from '@earendil-works/elanor-react';

import styles from './stack.module.css';

export default function StackGapAuto() {
  return (
    <Stack direction="row" gap="auto" align="center">
      <Text className={styles.item}>Website redesign</Text>
      <Text className={styles.item}>3 open tasks</Text>
    </Stack>
  );
}
