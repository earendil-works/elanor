import {
  EmptyState,
  KeyboardKey,
  KeyboardShortcut,
  SearchDialog,
  type SearchDialogStaticMessageState,
} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

/*
 * The docs search on Elanor's static search dialog. Results come from the site's search index
 * (`pages/search-index.json.ts`, searched by `scripts/docs-search-source.ts`), and keyboard
 * shortcuts open it (`scripts/docs-search.ts`), as does the top navigation's search button, which
 * names the dialog's id.
 */

export const docsSearchId = 'docs-search';
export const docsSearchIndex = '/search-index.json';

function DocsSearchMessage({
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

export function DocsSearchDialog(): React.JSX.Element {
  return (
    <SearchDialog.StaticRoot id={docsSearchId}>
      <SearchDialog.StaticPopup
        aria-label="Search documentation"
        data-elanor="docs-search"
        data-docs-search-index={docsSearchIndex}
      >
        <SearchDialog.Form>
          <SearchDialog.StaticInput placeholder="Search documentation" />
          <SearchDialog.StaticClose aria-label="Close search" />
        </SearchDialog.Form>
        <SearchDialog.StaticResults>
          <SearchDialog.StaticStatus />
          <DocsSearchMessage state="idle" title="Search the documentation">
            Find components, tokens, and their sections by title or content.
          </DocsSearchMessage>
          <DocsSearchMessage state="short" title="Keep typing">
            Search starts at two characters.
          </DocsSearchMessage>
          <DocsSearchMessage state="loading" title="Loading search">
            The search index is on its way.
          </DocsSearchMessage>
          <DocsSearchMessage state="empty" title="No results">
            Nothing in the documentation matches “<SearchDialog.StaticQuery />
            ”. Try other words, or browse the navigation.
          </DocsSearchMessage>
          <DocsSearchMessage state="error" title="Search isn’t available">
            The search index didn’t load. Close search and open it again to retry, or browse the
            navigation.
          </DocsSearchMessage>
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
