/** @jsxImportSource react */
import {
  EmptyState,
  KeyboardKey,
  KeyboardShortcut,
  SearchDialog,
  type SearchDialogStaticMessageState,
} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

/*
 * The search on Elanor's static search dialog. Results come from the site's search index
 * (`routes/search-index.json.ts`, searched by `scripts/docs-search-source.ts`); keyboard shortcuts
 * open it (`scripts/docs-search.ts`), as does the top navigation's search button.
 */

export const docsSearchId = 'docs-search';

function Message({
  state,
  title,
  children,
}: {
  readonly state: SearchDialogStaticMessageState;
  readonly title: string;
  readonly children: ReactNode;
}) {
  return (
    <SearchDialog.StaticMessage state={state}>
      <EmptyState.Root>
        <EmptyState.Body>
          <EmptyState.Copy>
            <EmptyState.Title level={2}>{title}</EmptyState.Title>
            <EmptyState.Description>{children}</EmptyState.Description>
          </EmptyState.Copy>
        </EmptyState.Body>
      </EmptyState.Root>
    </SearchDialog.StaticMessage>
  );
}

export function DocsSearch({index}: {readonly index: string}): React.JSX.Element {
  return (
    <SearchDialog.StaticRoot id={docsSearchId}>
      <SearchDialog.StaticPopup
        aria-label="Search documentation"
        data-elanor="docs-search"
        data-docs-search-index={index}
      >
        <SearchDialog.Form>
          <SearchDialog.StaticInput placeholder="Search documentation" />
          <SearchDialog.StaticClose aria-label="Close search" />
        </SearchDialog.Form>
        <SearchDialog.StaticResults>
          <SearchDialog.StaticStatus />
          <Message state="idle" title="Search the documentation">
            Find pages and their sections by title or content.
          </Message>
          <Message state="short" title="Keep typing">
            Search starts at two characters.
          </Message>
          <Message state="loading" title="Loading search">
            The search index is on its way.
          </Message>
          <Message state="empty" title="No results">
            Nothing in the documentation matches “<SearchDialog.StaticQuery />
            ”. Try other words, or browse the navigation.
          </Message>
          <Message state="error" title="Search isn’t available">
            The search index didn’t load. Close search and open it again to retry, or browse the
            navigation.
          </Message>
          <SearchDialog.StaticList aria-label="Results" />
        </SearchDialog.StaticResults>
        <SearchDialog.Footer>
          <SearchDialog.Hint>
            <KeyboardShortcut>
              <KeyboardKey>↑</KeyboardKey>
              <KeyboardKey>↓</KeyboardKey>
            </KeyboardShortcut>
            to select
          </SearchDialog.Hint>
          <SearchDialog.Hint>
            <KeyboardKey>↵</KeyboardKey>
            to open
          </SearchDialog.Hint>
          <SearchDialog.Hint>
            <KeyboardKey>Esc</KeyboardKey>
            to close
          </SearchDialog.Hint>
        </SearchDialog.Footer>
      </SearchDialog.StaticPopup>
    </SearchDialog.StaticRoot>
  );
}
