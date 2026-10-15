import {KeyboardKey, KeyboardShortcut, SearchDialog, Text} from '@earendil-works/elanor-react';
import {useState} from 'react';

const pages = [
  {
    href: '#getting-started',
    section: 'Guides',
    title: 'Getting started',
    excerpt: 'Install the command-line tool, sign in, and create your first project.',
  },
  {
    href: '#deploying',
    section: 'Guides',
    title: 'Deploying a project',
    excerpt: 'Every project deploys from its default branch. Connect a repository first.',
  },
  {
    href: '#rollbacks',
    section: 'Guides',
    title: 'Rollbacks',
    excerpt: 'A deploy that fails its checks never replaces the running version.',
  },
  {
    href: '#configuration',
    section: 'Reference',
    title: 'Configuration file',
    excerpt: 'Settings for builds, environments, and domains, in one file at the project root.',
  },
];

export default function SearchDialogDemo() {
  const [query, setQuery] = useState('');
  const terms = query.trim().toLowerCase();
  const results = terms
    ? pages.filter((page) => `${page.title} ${page.excerpt}`.toLowerCase().includes(terms))
    : [];

  return (
    <SearchDialog.Root>
      <SearchDialog.Trigger
        shortcut={
          <KeyboardShortcut>
            <KeyboardKey>Ctrl</KeyboardKey>
            <KeyboardKey>K</KeyboardKey>
          </KeyboardShortcut>
        }
      >
        Search documentation
      </SearchDialog.Trigger>
      <SearchDialog.Popup aria-label="Search documentation" value={query} onValueChange={setQuery}>
        <SearchDialog.Form>
          <SearchDialog.Input placeholder="Search documentation" />
          <SearchDialog.Close aria-label="Close search" />
        </SearchDialog.Form>
        <SearchDialog.Results>
          <SearchDialog.Status>
            {terms ? `${results.length} ${results.length === 1 ? 'result' : 'results'}` : ''}
          </SearchDialog.Status>
          {terms && results.length === 0 ? (
            <SearchDialog.Message>
              <Text>No results for “{query.trim()}”.</Text>
            </SearchDialog.Message>
          ) : null}
          {terms ? null : (
            <SearchDialog.Message>
              <Text>Search guides and reference pages.</Text>
            </SearchDialog.Message>
          )}
          <SearchDialog.List aria-label="Results">
            {results.map((page) => (
              <SearchDialog.Result key={page.href} href={page.href}>
                <SearchDialog.ResultContext>{page.section}</SearchDialog.ResultContext>
                <SearchDialog.ResultTitle>{page.title}</SearchDialog.ResultTitle>
                <SearchDialog.ResultExcerpt>{page.excerpt}</SearchDialog.ResultExcerpt>
              </SearchDialog.Result>
            ))}
          </SearchDialog.List>
        </SearchDialog.Results>
        <SearchDialog.Footer>
          <SearchDialog.Hint>
            <KeyboardKey>↑</KeyboardKey>
            <KeyboardKey>↓</KeyboardKey> to move
          </SearchDialog.Hint>
          <SearchDialog.Hint>
            <KeyboardKey>↵</KeyboardKey> to open
          </SearchDialog.Hint>
          <SearchDialog.Hint>
            <KeyboardKey>Esc</KeyboardKey> to close
          </SearchDialog.Hint>
        </SearchDialog.Footer>
      </SearchDialog.Popup>
    </SearchDialog.Root>
  );
}
