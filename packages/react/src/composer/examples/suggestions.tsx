import {DescriptionIcon, TerminalIcon} from '@earendil-works/elanor-icons-react';
import {
  Chip,
  Composer,
  type ComposerSuggestionResults,
  type ComposerSuggestionTrigger,
  type ComposerValue,
} from '@earendil-works/elanor-react';
import {useEffect, useState} from 'react';

import styles from './composer.module.css';

type Suggestion =
  | {readonly kind: 'file'; readonly id: string; readonly label: string; readonly path: string}
  | {
      readonly kind: 'command';
      readonly id: string;
      readonly label: string;
      readonly description: string;
    };

const paths = [
  'README.md',
  'package.json',
  'docs/releases.md',
  'src/composer/prompt.tsx',
  'src/composer/root.tsx',
  'src/composer/suggestions.tsx',
];

const commands: Suggestion[] = [
  {kind: 'command', id: 'review', label: 'review', description: 'Review the current branch'},
  {kind: 'command', id: 'test', label: 'test', description: 'Run the tests'},
  {
    kind: 'command',
    id: 'release-notes',
    label: 'release-notes',
    description: 'Draft release notes',
  },
];

// The full-width forms are what Japanese and Chinese keyboards type.
const triggers: readonly ComposerSuggestionTrigger[] = [
  {character: '@'},
  {character: '＠'},
  {character: '/', position: 'start'},
  {character: '／', position: 'start'},
];

const isFileTrigger = (character: string) => character === '@' || character === '＠';

function searchFiles(query: string): Promise<Suggestion[]> {
  const found = paths
    .filter((path) => path.toLowerCase().includes(query.toLowerCase()))
    .map((path): Suggestion => ({
      kind: 'file',
      id: path,
      label: path.split('/').at(-1) ?? path,
      path,
    }));
  // Demo only: the delay stands in for a request to your server.
  return new Promise((resolve) => setTimeout(() => resolve(found), 300));
}

const toText = (value: ComposerValue<Suggestion>) =>
  Composer.toText(value, (chip) => (chip.kind === 'file' ? `@${chip.path}` : `/${chip.label}`));

function FileAndCommandSuggestions() {
  const {insert} = Composer.useActions<Suggestion>();
  const match = Composer.useSuggestionMatch(triggers);
  const [files, setFiles] = useState<ComposerSuggestionResults<Suggestion>>();

  useEffect(() => {
    if (!match || !isFileTrigger(match.character)) return undefined;
    let current = true;
    void searchFiles(match.query).then((items) => {
      if (current) setFiles({match, items});
    });
    return () => {
      current = false;
    };
  }, [match]);

  const results =
    match && !isFileTrigger(match.character)
      ? {match, items: commands.filter((command) => command.label.startsWith(match.query))}
      : files;

  return (
    <Composer.Suggestions
      match={match}
      results={results}
      onItemPick={(item, picked, {event}) =>
        insert([item, ' '], {at: picked.range, reason: 'item-press', event})
      }
    >
      <Composer.SuggestionStatus className={styles.visuallyHidden} />
      <Composer.SuggestionPositioner>
        <Composer.SuggestionPopup>
          <Composer.SuggestionList aria-label="Suggestions">
            {results?.items.map((item, index) => (
              <Composer.SuggestionItem key={item.id} index={index}>
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
            {match && isFileTrigger(match.character) ? 'No matching files' : 'No matching commands'}
          </Composer.SuggestionEmpty>
        </Composer.SuggestionPopup>
      </Composer.SuggestionPositioner>
    </Composer.Suggestions>
  );
}

export default function ComposerSuggestions() {
  return (
    <Composer.Root
      toText={toText}
      getChipDescription={(chip) => chip.kind}
      renderChip={(chip) => (
        <Chip.Root
          variant="soft"
          density="compact"
          title={chip.kind === 'file' ? chip.path : undefined}
        >
          <Chip.Icon>{chip.kind === 'file' ? <DescriptionIcon /> : <TerminalIcon />}</Chip.Icon>
          <Chip.Label>{chip.kind === 'file' ? chip.label : `/${chip.label}`}</Chip.Label>
          <Chip.Remove />
        </Chip.Root>
      )}
    >
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
