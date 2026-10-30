import {
  Button,
  CodeSnippet,
  CopyButton,
  Heading,
  Link,
  Search,
  Stack,
  Text,
} from '@earendil-works/elanor-react';
import {useDeferredValue, useEffect, useMemo, useRef, useState, type Ref} from 'react';

import {HighlightedCode} from './highlighted-code.tsx';

import styles from './icon-browser.module.css';

type IndexEntry = readonly [name: string, tags: string, component: string];

type IndexState =
  | {readonly status: 'loading'}
  | {readonly status: 'failed'}
  | {readonly status: 'ready'; readonly entries: readonly IndexEntry[]};

const PAGE_SIZE = 240;

/** Fetches on every mount, so the page's preload is used after client-side navigation too. */
function requestIndex(update: (state: IndexState) => void): void {
  fetch('/icons/search-index.json')
    .then((response) => {
      if (!response.ok) throw new Error(`Icon index request failed: ${response.status}`);
      return response.json() as Promise<IndexEntry[]>;
    })
    .then(
      (entries) => update({status: 'ready', entries}),
      () => update({status: 'failed'}),
    );
}

/** Keeps `?q=` in step with the search, so searches can be shared. */
function syncUrl(query: string): void {
  const url = new URL(window.location.href);
  if (query.trim()) url.searchParams.set('q', query.trim());
  else url.searchParams.delete('q');
  // Keep the router's history state.
  history.replaceState(history.state, '', url);
}

/** Ranks name matches before tag matches, with alphabetical ties. */
function searchIcons(index: readonly IndexEntry[], query: string): readonly IndexEntry[] {
  const terms = query
    .toLowerCase()
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean);
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
  return scored
    .sort((a, b) => b[1] - a[1] || a[0][0].localeCompare(b[0][0]))
    .map(([entry]) => entry);
}

/** The import line of an icon, with placeholders for the highlighter (`pages/icons.astro`). */
export const iconImportTemplate =
  "import {IconComponent} from '@earendil-works/elanor-icons-boiled-react/icon-name';";

interface IconBrowserProps {
  /** `iconImportTemplate`, highlighted. */
  readonly importHtml: string;
}

export function IconBrowser({importHtml}: IconBrowserProps): React.JSX.Element {
  const [index, setIndex] = useState<IndexState>({status: 'loading'});
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [selected, setSelected] = useState<IndexEntry | null>(null);
  const deferredQuery = useDeferredValue(query);
  const end = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const sidebar = useRef<HTMLElement>(null);
  const hasSelection = selected !== null;

  useEffect(() => {
    // `?q=` pre-fills the search, so searches can be linked.
    const initial = new URLSearchParams(window.location.search).get('q');
    // oxlint-disable-next-line react/set-state-in-effect -- Read the browser URL after hydration, preserving the server's initial query.
    if (initial) setQuery(initial);
  }, []);

  useEffect(() => {
    let active = true;
    requestIndex((state) => {
      if (active) setIndex(state);
    });
    return () => {
      active = false;
    };
  }, []);

  const results = useMemo(
    () => (index.status === 'ready' ? searchIcons(index.entries, deferredQuery) : []),
    [index, deferredQuery],
  );

  // Clicking anywhere but an icon or the sidebar, or pressing Escape, deselects the icon.
  useEffect(() => {
    if (!hasSelection) return;
    const deselectOutside = (event: PointerEvent) => {
      const target = event.target as Node;
      const onIcon =
        target instanceof Element && target.closest('button') && grid.current?.contains(target);
      if (!onIcon && !sidebar.current?.contains(target)) setSelected(null);
    };
    const deselectOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // The sidebar closes, so focus moves back to the selected icon, or the search if it is filtered out.
      if (sidebar.current?.contains(document.activeElement)) {
        const tile = grid.current?.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
        (tile ?? search.current)?.focus();
      }
      setSelected(null);
    };
    document.addEventListener('pointerdown', deselectOutside);
    document.addEventListener('keydown', deselectOnEscape);
    return () => {
      document.removeEventListener('pointerdown', deselectOutside);
      document.removeEventListener('keydown', deselectOnEscape);
    };
  }, [hasSelection]);

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
      <Search
        ref={search}
        rootClassName={styles.search}
        aria-label="Search icons"
        placeholder={
          index.status === 'ready'
            ? `Search ${index.entries.length} icons by name or keyword…`
            : index.status === 'failed'
              ? 'Search icons…'
              : 'Loading icons…'
        }
        value={query}
        onChange={(event) => {
          setQuery(event.currentTarget.value);
          setLimit(PAGE_SIZE);
          syncUrl(event.currentTarget.value);
        }}
      />
      <div className={styles.main}>
        {index.status === 'failed' ? (
          <Stack gap="small" align="start">
            <Text role="alert">Could not load icons. Please try again.</Text>
            <Button
              hierarchy="secondary"
              onClick={() => {
                setIndex({status: 'loading'});
                requestIndex(setIndex);
              }}
            >
              Retry
            </Button>
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
                <span
                  className={styles.glyph}
                  style={{maskImage: `url(/api/icons/${entry[0]}.svg)`}}
                  aria-hidden="true"
                />
                <span className={styles.name}>{entry[0]}</span>
              </button>
            </li>
          ))}
        </ul>
        <div ref={end} />
      </div>
      {selected ? <SelectedIcon entry={selected} importHtml={importHtml} ref={sidebar} /> : null}
    </div>
  );
}

interface SelectedIconProps {
  readonly entry: IndexEntry;
  readonly importHtml: string;
  readonly ref: Ref<HTMLElement>;
}

function SelectedIcon({
  entry: [name, , component],
  importHtml,
  ref,
}: SelectedIconProps): React.JSX.Element {
  const importLine = iconImportTemplate
    .replace('IconComponent', component)
    .replace('icon-name', name);
  // Icon names are kebab-case and components PascalCase, so they need no HTML escaping.
  const html = importHtml.replace('IconComponent', component).replace('icon-name', name);
  return (
    <aside ref={ref} className={styles.sidebar} aria-label="Selected icon">
      <Stack gap="medium">
        <span
          className={styles.large}
          style={{maskImage: `url(/api/icons/${name}.svg)`}}
          aria-hidden="true"
        />
        <Heading level={2} size={6}>
          {name}
        </Heading>
        <CodeSnippet
          className={styles.snippet}
          actions={<CopyButton key={importLine} value={importLine} aria-label="Copy import" />}
        >
          <HighlightedCode html={html} />
        </CodeSnippet>
        <Link href={`/api/icons/${name}.svg`} download data-astro-prefetch="false">
          Download SVG
        </Link>
      </Stack>
    </aside>
  );
}
