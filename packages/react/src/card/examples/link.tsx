import {Card, Heading, Text} from '@earendil-works/elanor-react';

export default function CardLink() {
  return (
    <Card render={<a href="#" />}>
      <Heading level={3}>Workspace settings</Heading>
      <Text>Manage members, billing, and security for your workspace.</Text>
    </Card>
  );
}
