import {Tabs} from '@earendil-works/elanor-react';

export default function TabsDemo() {
  return (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Project details">
        <Tabs.Tab value="overview">Overview</Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="billing">Billing</Tabs.Tab>
        <Tabs.Indicator />
      </Tabs.List>
      <Tabs.Panel value="overview">Website redesign · 3 members · 8 open tasks</Tabs.Panel>
      <Tabs.Panel value="activity">Alex added a task: Review the homepage.</Tabs.Panel>
      <Tabs.Panel value="billing">Free plan · No payment method required</Tabs.Panel>
    </Tabs.Root>
  );
}
