import {Button, Drawer, Text, Timeline} from '@earendil-works/elanor-react';
import {useState} from 'react';

const steps = [
  {id: 'search', title: 'Searched the docs', detail: 'Found 3 pages about drawers.'},
  {id: 'read', title: 'Read drawer.tsx', detail: 'The popup handles drag to close itself.'},
];

export default function DrawerStackSidePanel() {
  const [open, setOpen] = useState<string[]>([]);
  return (
    <Drawer.Root swipeDirection="right" onOpenChange={(isOpen) => !isOpen && setOpen([])}>
      <Drawer.Trigger render={<Button hierarchy="secondary" />}>Show activity</Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Backdrop />
        <Drawer.Viewport>
          <Drawer.Popup>
            <Drawer.Stack onBack={() => setOpen(open.slice(0, -1))}>
              <Drawer.Page key="activity" title="Activity">
                <Timeline.Root>
                  {steps.map((step) => (
                    <Timeline.Item
                      key={step.id}
                      title={step.title}
                      onClick={() => setOpen([step.id])}
                    />
                  ))}
                </Timeline.Root>
              </Drawer.Page>
              {open.map((id) => {
                const step = steps.find((candidate) => candidate.id === id)!;
                return (
                  <Drawer.Page key={id} title={step.title}>
                    <Text>{step.detail}</Text>
                  </Drawer.Page>
                );
              })}
            </Drawer.Stack>
          </Drawer.Popup>
        </Drawer.Viewport>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
