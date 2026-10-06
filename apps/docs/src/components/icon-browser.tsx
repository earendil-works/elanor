import {CloseIcon} from '@earendil-works/elanor-icons-react';
import {CodeSnippet, CopyButton, Heading, IconButton, Link, Search, Stack, Text} from '@earendil-works/elanor-react';
import {useDeferredValue, useEffect, useMemo, useRef, useState} from 'react';
import styles from './icon-browser.module.css';

type IndexEntry = readonly [name: string, tags: string, component: string];

const PAGE_SIZE = 240;

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
  const [selected, setSelected] = useState<IndexEntry | null>(null);
  const deferredQuery = useDeferredValue(query);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `?q=` pre-fills the search, so searches can be linked.
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQuery(initial);
    void fetch('/api/icons/search.json')
      .then((response) => response.json() as Promise<IndexEntry[]>)
      .then(setIndex);
  }, []);

  const results = useMemo(() => (index ? search(index, deferredQuery) : []), [index, deferredQuery]);
  const importLine = selected ? `import {${selected[2]}} from '@earendil-works/elanor-icons-react/${selected[0]}';` : '';

  // Infinite scroll: show the next page once the end of the list nears the viewport. Observing again after
  // each page keeps loading while the end stays in view.
  useEffect(() => {
    const target = end.current;
    if (!target || limit >= results.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setLimit((current) => current + PAGE_SIZE);
      },
      {rootMargin: '0px 0px 50% 0px'},
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [limit, results.length]);

  return (
    <div className={styles.browser}>
      <div className={selected ? `${styles.main} ${styles.withDetails}` : styles.main}>
        <Search
          aria-label="Search icons"
          placeholder={index ? `Search ${index.length} icons by name or keyword` : 'Loading icons…'}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setLimit(PAGE_SIZE);
          }}
        />
        <Text>{index ? `${results.length} icons` : 'Loading…'}</Text>
        <ul className={styles.grid}>
          {results.slice(0, limit).map((entry) => (
            <li key={entry[0]}>
              <button
                type="button"
                className={styles.tile}
                aria-pressed={entry[0] === selected?.[0]}
                onClick={() => setSelected(entry)}
              >
                <span className={styles.glyph} style={{maskImage: `url(/api/icons/${entry[0]}.svg)`}} aria-hidden="true" />
                <span className={styles.name}>{entry[0]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div ref={end} />
      </div>
      {selected ? (
        <aside className={styles.sidebar} aria-label="Selected icon">
          <Stack gap="medium">
            <div className={styles.header}>
              <span className={styles.large} style={{maskImage: `url(/api/icons/${selected[0]}.svg)`}} aria-hidden="true" />
              <IconButton aria-label="Close" onClick={() => setSelected(null)}>
                <CloseIcon />
              </IconButton>
            </div>
            <Heading level={2} size={3}>
              {selected[0]}
            </Heading>
            <CodeSnippet className={styles.snippet} actions={<CopyButton value={importLine} aria-label="Copy import" />}>
              {importLine}
            </CodeSnippet>
            <Link href={`/api/icons/${selected[0]}.svg`} download>
              Download SVG
            </Link>
          </Stack>
        </aside>
      ) : null}
    </div>
  );
}
