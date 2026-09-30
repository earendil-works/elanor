import {Button, CodeSnippet, CopyButton, Heading, Link, Search, Stack, Text} from '@earendil-works/elanor-react';
import {useDeferredValue, useEffect, useMemo, useState} from 'react';
import styles from './icon-browser.module.css';

type IndexEntry = readonly [name: string, tags: string];

const PAGE_SIZE = 240;

function componentName(name: string): string {
  const body = name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
  return `${/^\d/.test(body) ? 'Number' : ''}${body}Icon`;
}

/** Ranks name matches before tag matches, with alphabetical ties. */
function search(index: readonly IndexEntry[], query: string): readonly IndexEntry[] {
  const terms = query.toLowerCase().trim().split(/[\s_-]+/).filter(Boolean);
  if (terms.length === 0) return index;
  const scored: Array<[IndexEntry, number]> = [];
  for (const entry of index) {
    const name = entry[0].replaceAll('-', ' ');
    let score = 0;
    for (const term of terms) {
      if (name === term) score += 4;
      else if (name.startsWith(term)) score += 3;
      else if (name.includes(term)) score += 2;
      else if (entry[1].includes(term)) score += 1;
      else {
        score = 0;
        break;
      }
    }
    if (score > 0) scored.push([entry, score]);
  }
  return scored.sort((a, b) => b[1] - a[1] || a[0][0].localeCompare(b[0][0])).map(([entry]) => entry);
}

export function IconBrowser(): React.JSX.Element {
  const [index, setIndex] = useState<readonly IndexEntry[] | null>(null);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<string | null>(null);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    // `?q=` pre-fills the search, so searches can be linked.
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQuery(initial);
    void fetch('/api/icons/search.json')
      .then((response) => response.json() as Promise<IndexEntry[]>)
      .then(setIndex);
  }, []);

  const results = useMemo(() => (index ? search(index, deferredQuery) : []), [index, deferredQuery]);
  const importLine = selected
    ? `import {${componentName(selected)}} from '@earendil-works/elanor-icons-react/${selected}';`
    : '';

  return (
    <div className={styles.browser}>
      <Search
        aria-label="Search icons"
        placeholder={index ? `Search ${index.length} icons by name or keyword` : 'Loading icons…'}
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setLimit(PAGE_SIZE);
        }}
      />
      {selected ? (
        <section className={styles.detail} aria-live="polite">
          <span className={styles.large} style={{maskImage: `url(/api/icons/${selected}.svg)`}} aria-hidden="true" />
          <Stack gap="small">
            <Heading level={2} size={3}>
              {selected}
            </Heading>
            <CodeSnippet actions={<CopyButton value={importLine} aria-label="Copy import" />}>{importLine}</CodeSnippet>
            <Link href={`/api/icons/${selected}.svg`} download>
              Download SVG
            </Link>
          </Stack>
        </section>
      ) : null}
      <Text>{index ? `${results.length} icons` : 'Loading…'}</Text>
      <ul className={styles.grid}>
        {results.slice(0, limit).map(([name]) => (
          <li key={name}>
            <button
              type="button"
              className={styles.tile}
              aria-pressed={name === selected}
              onClick={() => setSelected(name)}
            >
              <span className={styles.glyph} style={{maskImage: `url(/api/icons/${name}.svg)`}} aria-hidden="true" />
              <span className={styles.name}>{name}</span>
            </button>
          </li>
        ))}
      </ul>
      {results.length > limit ? (
        <Button hierarchy="secondary" onClick={() => setLimit(limit + PAGE_SIZE)}>
          Show more
        </Button>
      ) : null}
    </div>
  );
}
