import {KeyboardKey, KeyboardShortcut, SearchDialog, Text} from '@earendil-works/elanor-react';
import {useEffect, useState} from 'react';

const searchDialog = SearchDialog.createHandle();

export default function SearchDialogKeyboardShortcutDemo() {
  const [query, setQuery] = useState('');

  // The application owns the shortcut: here, Ctrl+K or ⌘K opens the search.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing) return;
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchDialog.open(null);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <SearchDialog.Root handle={searchDialog} onOpenChange={(open) => open && setQuery('')}>
      <SearchDialog.Trigger
        aria-keyshortcuts="Control+K Meta+K"
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
          <SearchDialog.Message>
            <Text>
              {query.trim()
                ? `No results for “${query.trim()}”.`
                : 'Search guides and reference pages.'}
            </Text>
          </SearchDialog.Message>
        </SearchDialog.Results>
      </SearchDialog.Popup>
    </SearchDialog.Root>
  );
}
