import {Card, Heading, Link, Stack, Text} from '@earendil-works/elanor-react';

export default function CardCustomContent() {
  return (
    <Card>
      <Stack gap="small">
        <Heading level={3}>Workspace settings</Heading>
        <Text>Manage members, billing, and security for your workspace.</Text>
        <Link href="#">Open settings</Link>
      </Stack>
    </Card>
  );
}
