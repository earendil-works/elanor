import {Stack, Text} from '@earendil-works/elanor-react';

import styles from './stack.module.css';

export default function StackDemo() {
  return (
    <Stack>
      <Text className={styles.item}>Draft</Text>
      <Text className={styles.item}>In review</Text>
      <Text className={styles.item}>Published</Text>
    </Stack>
  );
}
