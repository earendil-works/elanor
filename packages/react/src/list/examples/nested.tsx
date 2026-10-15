import {List} from '@earendil-works/elanor-react';

export default function ListNested() {
  return (
    <List.Root>
      <List.Item>
        Workspace settings
        <List.Root>
          <List.Item>Members</List.Item>
          <List.Item>Billing</List.Item>
        </List.Root>
      </List.Item>
      <List.Item>Project settings</List.Item>
    </List.Root>
  );
}
