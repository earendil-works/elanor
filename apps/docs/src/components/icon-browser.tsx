import {Button, CodeSnippet, CopyButton, Heading, Link, Search, Stack, Text} from '@earendil-works/elanor-react';
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
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<IndexEntry | null>(null);
  const deferredQuery = useDeferredValue(query);
  const end = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const sidebar = useRef<HTMLElement>(null);

  useEffect(() => {
    // `?q=` pre-fills the search, so searches can be linked.
    const initial = new URLSearchParams(window.location.search).get('q');
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void fetch('/icons/search-index.json', {signal: controller.signal})
      .then((response) => {
        if (!response.ok) throw new Error(`Icon index request failed: ${response.status}`);
        return response.json() as Promise<IndexEntry[]>;
      })
      .then((entries) => {
        if (!controller.signal.aborted) setIndex(entries);
      })
      .catch(() => {
        if (!controller.signal.aborted) setLoadFailed(true);
      });
    return () => controller.abort();
  }, [attempt]);

  const results = useMemo(() => (index ? search(index, deferredQuery) : []), [index, deferredQuery]);
  const importLine = selected ? `import {${selected[2]}} from '@earendil-works/elanor-icons-react/${selected[0]}';` : '';

  // Clicking anywhere but an icon or the sidebar, or pressing Escape, deselects the icon.
  useEffect(() => {
    if (!selected) return;
    const deselectOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      const onIcon = target instanceof Element && target.closest('button') && grid.current?.contains(target);
      if (!onIcon && !sidebar.current?.contains(target)) setSelected(null);
    };
    const deselectOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.addEventListener('pointerdown', deselectOutside);
    document.addEventListener('keydown', deselectOnEscape);
    return () => {
      document.removeEventListener('pointerdown', deselectOutside);
      document.removeEventListener('keydown', deselectOnEscape);
    };
  }, [selected]);

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
      <div className={styles.main}>
        <Search
          aria-label="Search icons"
          placeholder={index ? `Search ${index.length} icons by name or keyword` : loadFailed ? 'Search icons' : 'Loading icons…'}
          value={query}
          onChange={(event) => {
            setQuery(event.currentTarget.value);
            setLimit(PAGE_SIZE);
          }}
        />
        {loadFailed ? (
          <Stack gap="small" align="start">
            <Text role="alert">Could not load icons. Please try again.</Text>
            <Button hierarchy="secondary" onClick={() => {
              setLoadFailed(false);
              setAttempt(current => current + 1);
            }}>Retry</Button>
          </Stack>
        ) : null}
        <ul ref={grid} className={styles.grid}>
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
        <aside ref={sidebar} className={styles.sidebar} aria-label="Selected icon">
          <Stack gap="medium">
            <span className={styles.large} style={{maskImage: `url(/api/icons/${selected[0]}.svg)`}} aria-hidden="true" />
            <Heading level={2} size={3}>
              {selected[0]}
            </Heading>
            <CodeSnippet className={styles.snippet} actions={<CopyButton key={importLine} value={importLine} aria-label="Copy import" />}>
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
