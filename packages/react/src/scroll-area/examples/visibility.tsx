import {Button, ScrollArea, Stack, Text} from '@earendil-works/elanor-react';
import {useRef} from 'react';

import styles from './scroll-area.module.css';

export default function ScrollAreaVisibility() {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <Stack gap="medium" align="stretch">
      <ScrollArea.Root className={styles.frame}>
        <ScrollArea.Viewport ref={viewportRef} role="region" aria-label="Build log">
          <ScrollArea.Content className={styles.entries}>
            {Array.from({length: 12}, (_, index) => (
              <Text key={index}>
                Step {index + 1}: compiled the package and uploaded its assets.
              </Text>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar visibility="scrolling">
          <ScrollArea.Thumb />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
      <Stack direction="row" gap="small">
        <Button
          hierarchy="secondary"
          onClick={() => {
            const viewport = viewportRef.current;
            viewport?.scrollTo({top: viewport.scrollHeight, behavior: 'smooth'});
          }}
        >
          Jump to latest step
        </Button>
      </Stack>
    </Stack>
  );
}
