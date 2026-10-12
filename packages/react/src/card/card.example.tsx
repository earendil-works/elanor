import {Card, Heading, Link, Stack, Text} from '@earendil-works/elanor-react';

export function CardSummaryExample(): React.JSX.Element {
  return (
    <Card label="Active projects" value="12" description="Across three teams" />
  );
}

export function CardContentExample(): React.JSX.Element {
  return (
    <Card>
      <Stack gap="small">
        <Heading level={2}>Workspace settings</Heading>
        <Text>Group related controls with a label and supporting description.</Text>
        <Link href="/components/field">Explore form fields</Link>
      </Stack>
    </Card>
  );
}
