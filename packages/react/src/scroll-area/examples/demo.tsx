import {ScrollArea, Text} from '@earendil-works/elanor-react';

import styles from './scroll-area.module.css';

export default function ScrollAreaDemo() {
  return (
    <ScrollArea.Root className={styles.frame}>
      <ScrollArea.Viewport role="region" aria-label="Release notes">
        <ScrollArea.Content className={styles.entries}>
          {Array.from({length: 12}, (_, index) => (
            <Text key={index}>Release {index + 1}: navigation and layout improvements.</Text>
          ))}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}
