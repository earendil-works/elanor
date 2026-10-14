import {FolderOpenIcon} from '@earendil-works/elanor-icons-react';
import {Button, EmptyState} from '@earendil-works/elanor-react';

export default function EmptyStateDemo() {
  return (
    <EmptyState.Root>
      <EmptyState.Illustration>
        <FolderOpenIcon size={64} />
      </EmptyState.Illustration>
      <EmptyState.Body>
        <EmptyState.Copy>
          <EmptyState.Title level={2}>No saved views</EmptyState.Title>
          <EmptyState.Description>
            Save a set of filters to find the members you need faster.
          </EmptyState.Description>
        </EmptyState.Copy>
        <EmptyState.Actions>
          <Button>Create view</Button>
        </EmptyState.Actions>
      </EmptyState.Body>
    </EmptyState.Root>
  );
}
