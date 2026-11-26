import {DescriptionIcon, TerminalIcon} from '@earendil-works/elanor-icons-react';
import {
  Chip,
  Composer,
  type ComposerSuggestionResults,
  type ComposerSuggestionTrigger,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useEffect, useRef, useState} from 'react';

import styles from './composer.module.css';

type Suggestion =
  | {readonly kind: 'file'; readonly id: string; readonly label: string; readonly path: string}
  | {
      readonly kind: 'command';
      readonly id: string;
      readonly label: string;
      readonly description: string;
      readonly available: boolean;
    };

const paths = [
  'README.md',
  'package.json',
  'docs/releases.md',
  'src/composer/prompt.tsx',
  'src/composer/root.tsx',
  'src/composer/suggestions.tsx',
];

const command = (label: string, description: string, available = true): Suggestion => ({
  kind: 'command',
  id: label,
  label,
  description,
  available,
});

const commands = [
  command('review', 'Review the current branch'),
  command('test', 'Run the tests'),
  command('release-notes', 'Draft release notes'),
  command('deploy', 'Needs a clean branch', false),
];

const triggers: readonly ComposerSuggestionTrigger[] = [
  {character: '@'},
  {character: '/', position: 'start'},
];

function searchFiles(query: string, signal: AbortSignal): Promise<Suggestion[]> {
  const found = paths
    .filter((path) => path.toLowerCase().includes(query.toLowerCase()))
    .map((path): Suggestion => ({
      kind: 'file',
      id: path,
      label: path.split('/').at(-1) ?? path,
      path,
    }));
  // Demo only: replace the timer with a request to your server that takes `signal`.
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(found), 300);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
}

const toText = (value: ComposerValue<Suggestion>) =>
  Composer.toText(value, (chip) => (chip.kind === 'file' ? `@${chip.path}` : `/${chip.label}`));

function FileAndCommandSuggestions() {
  const {insert} = Composer.useActions<Suggestion>();
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
        insert(item, {at: picked.range, reason: 'item-press', event})
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
                  key={item.id}
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
              {match && match.character === '@' ? 'No matching files' : 'No matching commands'}
            </Composer.SuggestionEmpty>
          </Composer.SuggestionPopup>
        </Composer.SuggestionPositioner>
      </Composer.SuggestionPortal>
    </Composer.Suggestions>
  );
}

const renderChip = (chip: Suggestion) => (
  <Chip.Root variant="soft" density="compact">
    <Chip.Icon>{chip.kind === 'file' ? <DescriptionIcon /> : <TerminalIcon />}</Chip.Icon>
    <Chip.Label>{chip.kind === 'file' ? chip.label : `/${chip.label}`}</Chip.Label>
  </Chip.Root>
);

export default function ComposerSuggestions() {
  return (
    <Composer.Root toText={toText} getChipDescription={(chip) => chip.kind} renderChip={renderChip}>
      <Composer.Panel>
        <Composer.Field>
          <Composer.Prompt
            aria-label="Message"
            placeholder="Type @ for a file, or / at the start for a command…"
          />
          <Composer.Controls className={styles.end}>
            <Composer.Submit />
          </Composer.Controls>
        </Composer.Field>
      </Composer.Panel>
      <FileAndCommandSuggestions />
    </Composer.Root>
  );
}
