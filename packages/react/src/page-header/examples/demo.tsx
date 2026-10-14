import {Button, PageHeader} from '@earendil-works/elanor-react';

export default function PageHeaderDemo() {
  return (
    <PageHeader.Root>
      <PageHeader.Row>
        <PageHeader.Title level={2}>Members</PageHeader.Title>
        <PageHeader.Actions>
          <Button hierarchy="secondary">Export</Button>
          <Button>Invite members</Button>
        </PageHeader.Actions>
      </PageHeader.Row>
      <PageHeader.Description>
        Manage who can access this workspace and what they can do.
      </PageHeader.Description>
    </PageHeader.Root>
  );
}
