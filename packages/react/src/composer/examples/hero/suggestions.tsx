import {
  Composer,
  type ComposerSuggestionResults,
  type ComposerSuggestionTrigger,
} from '@earendil-works/elanor-react';
import {useEffect, useRef, useState} from 'react';

import type {MessageChip} from './chips.tsx';

import styles from '../composer.module.css';

type Command = {
  readonly kind: 'command';
  readonly label: string;
  readonly description: string;
  readonly available: boolean;
};

type Suggestion = {readonly kind: 'file'; readonly path: string} | Command;

const paths = [
  'README.md',
  'package.json',
  'docs/releases.md',
  'scripts/build.mjs',
  'src/composer/prompt.tsx',
  'src/composer/root.tsx',
];

const commands: readonly Command[] = [
  {kind: 'command', label: 'review', description: 'Review the current branch', available: true},
  {kind: 'command', label: 'test', description: 'Run the tests', available: true},
  {kind: 'command', label: 'release-notes', description: 'Draft release notes', available: true},
  {kind: 'command', label: 'deploy', description: 'Needs a clean branch', available: false},
];

const triggers: readonly ComposerSuggestionTrigger[] = [
  {character: '@'},
  {character: '/', position: 'start'},
];

function searchFiles(query: string, signal: AbortSignal): Promise<Suggestion[]> {
  const found = paths
    .filter((path) => path.toLowerCase().includes(query.toLowerCase()))
    .map((path): Suggestion => ({kind: 'file', path}));
  // Demo only: replace the timer with a request to your server that takes `signal`.
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(found), 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

const chipOf = (item: Suggestion): MessageChip => {
  const id = crypto.randomUUID();
  return item.kind === 'file'
    ? {kind: 'file', id, label: item.path.split('/').at(-1) ?? item.path, path: item.path}
    : {kind: 'command', id, label: item.label, description: item.description};
};

const keyOf = (item: Suggestion) => (item.kind === 'file' ? item.path : item.label);

/** `@` for a file anywhere a word starts, `/` for a command at the start. */
export function FileAndCommandSuggestions() {
  const {insert} = Composer.useActions<MessageChip>();
  const match = Composer.useSuggestionMatch(triggers);
  const [files, setFiles] = useState<ComposerSuggestionResults<Suggestion>>();
  const request = useRef<AbortController>(null);

  useEffect(() => {
    if (!match || match.character !== '@') return undefined;
    const controller = new AbortController();
    request.current = controller;
    searchFiles(match.query, controller.signal).then(
      (items) => setFiles({match, items}),
      () => {},
    );
    return () => controller.abort();
  }, [match]);

  const results =
    match && match.character !== '@'
      ? {match, items: commands.filter((command) => command.label.startsWith(match.query))}
      : files;

  return (
    <Composer.Suggestions
      match={match}
      results={results}
      onItemPick={(item, picked, {event}) =>
        insert(chipOf(item), {at: picked.range, reason: 'item-press', event, space: true})
      }
      onOpenChange={(open) => {
        if (!open) request.current?.abort();
      }}
    >
      <Composer.SuggestionStatus />
      <Composer.SuggestionPortal>
        <Composer.SuggestionPositioner>
          <Composer.SuggestionPopup>
            <Composer.SuggestionList aria-label="Suggestions">
              {results?.items.map((item, index) => (
                <Composer.SuggestionItem
                  key={keyOf(item)}
                  index={index}
                  disabled={item.kind === 'command' && !item.available}
                >
                  {item.kind === 'file' ? (
                    item.path
                  ) : (
                    <>
                      {`/${item.label}`}
                      <span className={styles.description}>{item.description}</span>
                    </>
                  )}
                </Composer.SuggestionItem>
              ))}
            </Composer.SuggestionList>
            <Composer.SuggestionEmpty>
              {match?.character === '@' ? 'No matching files' : 'No matching commands'}
            </Composer.SuggestionEmpty>
          </Composer.SuggestionPopup>
        </Composer.SuggestionPositioner>
      </Composer.SuggestionPortal>
    </Composer.Suggestions>
  );
}
