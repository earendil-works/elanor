import {Grid, Heading, Search} from '@earendil-works/elanor-react';

import {CodeText} from './code-text.tsx';
import {FilterEmptyState} from './filter-empty-state.tsx';
import {LinkCard} from './link-card.tsx';

import styles from './components-overview.module.css';

export interface ComponentSummary {
  readonly id: string;
  readonly name: string;
  /** Backticks render as inline code. */
  readonly description: string;
}

export interface ComponentGroupSummary {
  readonly category: string;
  readonly label: string;
  readonly components: readonly ComponentSummary[];
}

interface ComponentsOverviewProps {
  readonly groups: readonly ComponentGroupSummary[];
}

/** Static HTML; `scripts/list-filter.ts` filters it through the `data-filter-*` attributes. */
export function ComponentsOverview({groups}: ComponentsOverviewProps): React.JSX.Element {
  const total = groups.reduce((sum, group) => sum + group.components.length, 0);

  return (
    <div className={styles.overview} data-filter="components">
      <Search
        aria-label="Search components"
        placeholder={`Search ${total} components…`}
        data-filter-search
      />
      <p role="status" className="visually-hidden" data-filter-status />
      {groups.map((group) => (
        <section
          key={group.category}
          className={styles.group}
          aria-labelledby={`category-${group.category}`}
          data-filter-group
        >
          <Heading level={2} size={4} id={`category-${group.category}`}>
            {group.label}
          </Heading>
          <Grid.Root render={<ul className={styles.list} />}>
            {group.components.map((component) => (
              <Grid.Item
                key={component.id}
                span={{base: 'full', xSmall: 6, medium: 4}}
                render={<li />}
                data-filter-item
              >
                <LinkCard href={`/components/${component.id}/`} title={component.name}>
                  <p>
                    <CodeText text={component.description} />
                  </p>
                </LinkCard>
              </Grid.Item>
            ))}
          </Grid.Root>
        </section>
      ))}
      <FilterEmptyState noun="components" />
    </div>
  );
}
