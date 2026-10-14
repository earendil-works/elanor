import {ScrollArea, Text} from '@earendil-works/elanor-react';

import styles from './scroll-area.module.css';

export default function ScrollAreaBothAxes() {
  return (
    <ScrollArea.Root className={styles.frame}>
      <ScrollArea.Viewport role="region" aria-label="Deployment log">
        <ScrollArea.Content className={`${styles.entries} ${styles.wide}`}>
          {Array.from({length: 8}, (_, index) => (
            <Text key={index}>
              Step {index + 1}: building, testing, and uploading assets to every region.
            </Text>
          ))}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Scrollbar orientation="horizontal">
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
