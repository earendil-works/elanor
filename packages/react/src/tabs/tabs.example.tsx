import {Tabs} from './tabs.tsx';

export function TabsExample(): React.JSX.Element {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List>
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Overview content</Tabs.Panel>
      <Tabs.Panel value="activity">Activity content</Tabs.Panel>
      <Tabs.Panel value="billing">Billing content</Tabs.Panel>
    </Tabs.Root>
  );
}
