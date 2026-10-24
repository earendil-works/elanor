import {SearchOffIcon} from '@earendil-works/elanor-icons-boiled-react';
import {Button, EmptyState} from '@earendil-works/elanor-react';

/** The no-results message that `scripts/list-filter.ts` shows and fills in. */
export function FilterEmptyState({noun}: {readonly noun: string}): React.JSX.Element {
  return (
    <div hidden data-filter-empty>
      <EmptyState.Root>
        <EmptyState.Illustration>
          <SearchOffIcon size={64} />
        </EmptyState.Illustration>
        <EmptyState.Body>
          <EmptyState.Copy>
            <EmptyState.Title level={2}>{`No matching ${noun}`}</EmptyState.Title>
            <EmptyState.Description>
              Nothing matches “<span data-filter-query />
              ”. Try a shorter or different word.
            </EmptyState.Description>
          </EmptyState.Copy>
          <EmptyState.Actions>
            <Button hierarchy="secondary" data-filter-clear>
              Clear search
            </Button>
          </EmptyState.Actions>
        </EmptyState.Body>
      </EmptyState.Root>
    </div>
  );
}
