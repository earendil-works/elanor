import {CodeSnippet, Grid, Heading, InlineCode, Link, Text} from '@earendil-works/elanor-react';

import {LinkCard} from './link-card.tsx';
import {CopyStatus, StaticCopyButton} from './static-copy-button.tsx';

import styles from './tokens-overview.module.css';

export interface TokenAreaSummary {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly href: string;
  readonly count: number;
}

interface TokensOverviewProps {
  readonly areas: readonly TokenAreaSummary[];
}

const usage = `@import '@earendil-works/design-tokens/radius.css';

.note {
  color: var(--semantic-color-text-secondary);
}`;

const stylelintHref =
  'https://github.com/earendil-works/elanor/blob/main/packages/stylelint-plugin-design-tokens/README.md';

/** How to use the tokens, then a card per area. Static HTML; `scripts/copy-buttons.ts` runs the copy button. */
export function TokensOverview({areas}: TokensOverviewProps): React.JSX.Element {
  return (
    <>
      <section className={styles.section} aria-labelledby="use">
        <Heading level={2} size={4} id="use">
          Use
        </Heading>
        <Text>
          Import one brand stylesheet: <InlineCode>radius</InlineCode>, <InlineCode>pi</InlineCode>,{' '}
          <InlineCode>earendil</InlineCode>, or <InlineCode>lefos</InlineCode>.
        </Text>
        <CodeSnippet
          id="token-usage"
          actions={
            <StaticCopyButton
              value={usage}
              aria-label="Copy the example"
              aria-describedby="token-usage"
            />
          }
        >
          {usage}
        </CodeSnippet>
        <CopyStatus />
        <Text>
          Colors follow the system’s light or dark setting. To fix one, set{' '}
          <InlineCode>data-color-scheme</InlineCode> to <InlineCode>light</InlineCode> or{' '}
          <InlineCode>dark</InlineCode> on the root element. With reduced motion, movement is
          instant.
        </Text>
        <Text>
          The <Link href={stylelintHref}>Stylelint plugin</Link> flags raw values and unknown
          tokens.
        </Text>
        <Text>
          For tools: <Link href="/api/tokens/index.json">JSON API</Link> and{' '}
          <Link href="/llms.txt">llms.txt</Link>.
        </Text>
      </section>
      <section className={styles.section} aria-labelledby="browse">
        <Heading level={2} size={4} id="browse">
          Browse
        </Heading>
        <Grid.Root render={<ul className={styles.list} />}>
          {areas.map((area) => (
            <Grid.Item key={area.id} span={{base: 'full', xSmall: 6, medium: 4}} render={<li />}>
              <LinkCard href={area.href} title={area.label}>
                <p>{area.summary}</p>
                <p>{area.count} tokens</p>
              </LinkCard>
            </Grid.Item>
          ))}
        </Grid.Root>
      </section>
    </>
  );
}
