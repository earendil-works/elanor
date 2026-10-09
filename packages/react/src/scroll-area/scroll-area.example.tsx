import {DirectionProvider} from '@base-ui/react/direction-provider';
import {Button, Heading, Stack, Text, ScrollArea} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

import styles from './scroll-area.example.module.css';

export function ScrollAreaExample() {
  const [direction, setDirection] = useState<'ltr' | 'rtl'>('ltr');
  const [position, setPosition] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  return (
    <DirectionProvider direction={direction}>
      <Stack align="stretch" gap="large" dir={direction} style={{inlineSize: '100%'}}>
        <label>
          Direction{' '}
          <select
            value={direction}
            onChange={(event) => setDirection(event.currentTarget.value as 'ltr' | 'rtl')}
          >
            <option value="ltr">Left to right</option>
            <option value="rtl">Right to left</option>
          </select>
        </label>
        <Heading level={2}>Vertical scrolling</Heading>
        <Text>
          Tab to the named viewport and use arrow keys or Page Down. The scrollbar also supports
          dragging.
        </Text>
        <ScrollArea.Root className={styles.frame}>
          <ScrollArea.Viewport
            ref={viewportRef}
            role="region"
            aria-label="Release notes"
            onScroll={(event) => setPosition(Math.round(event.currentTarget.scrollTop))}
          >
            <ScrollArea.Content className={styles.entries}>
              {Array.from({length: 12}, (_, index) => (
                <Text key={index}>
                  Release {index + 1}: navigation, layout, and component improvements.
                </Text>
              ))}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar>
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
        <Stack direction="row" wrap="wrap">
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
          <Text>Viewport scrollTop: {position}px</Text>
        </Stack>

        <Heading level={2}>Both axes</Heading>
        <ScrollArea.Root className={styles.frame}>
          <ScrollArea.Viewport role="region" aria-label="Wide content example">
            <ScrollArea.Content>
              <div className={styles.wideContent}>
                {Array.from({length: 8}, (_, index) => (
                  <Text key={index}>
                    Row {index + 1}: this deliberately wide region demonstrates horizontal overflow
                    as well as vertical scrolling.
                  </Text>
                ))}
              </div>
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

        <Heading level={2}>No overflow</Heading>
        <Text>No scrollbar and no extra viewport tab stop when everything fits.</Text>
        <ScrollArea.Root className={styles.shortFrame}>
          <ScrollArea.Viewport role="region" aria-label="Short content example">
            <ScrollArea.Content>All content fits.</ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar>
            <ScrollArea.Thumb />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </Stack>
    </DirectionProvider>
  );
}
