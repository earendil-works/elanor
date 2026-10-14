import {Card, Heading, Page, Text} from '@earendil-works/elanor-react';

export default function PageDemo() {
  return (
    <Page>
      <Heading level={2} size={1}>
        Workspace overview
      </Heading>
      <Text>Review your team's projects and recent activity.</Text>
      <Card label="Active projects" value="12" description="Across three teams" />
    </Page>
  );
}
