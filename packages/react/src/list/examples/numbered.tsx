import {List} from '@earendil-works/elanor-react';

export default function ListNumbered() {
  return (
    <List.Root render={<ol />}>
      <List.Item>Install the command-line tool</List.Item>
      <List.Item>Sign in with your workspace account</List.Item>
      <List.Item>Deploy the project</List.Item>
    </List.Root>
  );
}
