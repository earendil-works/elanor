import {SearchOffIcon} from '@earendil-works/elanor-icons-boiled-react';
import {
  Button,
  Card,
  EmptyState,
  Grid,
  Heading,
  InlineCode,
  Link,
  Search,
} from '@earendil-works/elanor-react';

import styles from './components-overview.module.css';

export interface ComponentSummary {
  readonly id: string;
  readonly name: string;
  /** One sentence or paragraph; text in backticks renders as inline code. */
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

function Description({text}: {readonly text: string}): React.JSX.Element {
  return (
    <p className={styles.description}>
      {text
        .split('`')
        .map((part, index) =>
          index % 2 === 1 ? <InlineCode key={index}>{part}</InlineCode> : part,
        )}
    </p>
  );
}

/**
 * Every component as a card, grouped by category. It renders as static HTML; `scripts/components-filter.ts`
 * filters it through the `data-components-*` attributes.
 */
export function ComponentsOverview({groups}: ComponentsOverviewProps): React.JSX.Element {
  const total = groups.reduce((sum, group) => sum + group.components.length, 0);

  return (
    <div className={styles.overview} data-components-overview>
      <Search
        aria-label="Search components"
        placeholder={`Search ${total} components`}
        data-components-search
      />
      <p role="status" className={styles.visuallyHidden} data-components-status />
      {groups.map((group) => (
        <section
          key={group.category}
          className={styles.group}
          aria-labelledby={`category-${group.category}`}
          data-components-group
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
                data-components-item
              >
                <Card className={styles.card}>
                  <Heading level={3} size={6}>
                    <Link className={styles.link} href={`/components/${component.id}/`}>
                      {component.name}
                    </Link>
                  </Heading>
                  <Description text={component.description} />
                </Card>
              </Grid.Item>
            ))}
          </Grid.Root>
        </section>
      ))}
      <div hidden data-components-empty>
        <EmptyState.Root>
          <EmptyState.Illustration>
            <SearchOffIcon size={64} />
          </EmptyState.Illustration>
          <EmptyState.Body>
            <EmptyState.Copy>
              <EmptyState.Title level={2}>No matching components</EmptyState.Title>
              <EmptyState.Description>
                Nothing matches “<span data-components-query />
                ”. Try a shorter or different word.
              </EmptyState.Description>
            </EmptyState.Copy>
            <EmptyState.Actions>
              <Button hierarchy="secondary" data-components-clear>
                Clear search
              </Button>
            </EmptyState.Actions>
          </EmptyState.Body>
        </EmptyState.Root>
      </div>
    </div>
  );
}
