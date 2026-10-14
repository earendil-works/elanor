import {Button, ScrollArea, Stack, Text} from '@earendil-works/elanor-react';
import {useRef} from 'react';

import styles from './scroll-area.module.css';

export default function ScrollAreaScrollFromCode() {
  const viewportRef = useRef<HTMLDivElement>(null);

  return (
    <Stack gap="medium" align="stretch">
      <ScrollArea.Root className={styles.frame}>
        <ScrollArea.Viewport ref={viewportRef} role="region" aria-label="Release notes">
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
      <Stack direction="row" gap="small">
        <Button hierarchy="secondary" onClick={() => viewportRef.current?.scrollTo({top: 0})}>
          Scroll to start
        </Button>
        <Button
          hierarchy="secondary"
          onClick={() => {
            const viewport = viewportRef.current;
            viewport?.scrollTo({top: viewport.scrollHeight});
          }}
        >
          Scroll to end
        </Button>
      </Stack>
    </Stack>
  );
}
