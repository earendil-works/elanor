import {CodeSnippet, Heading, InlineCode, KeyValue, Link, Text} from '@earendil-works/elanor-react';
import {Fragment, type ReactElement, type ReactNode} from 'react';

import type {FontFamily, FontsPage} from '../lib/fonts.ts';
import {CopyStatus, StaticCopyButton} from './static-copy-button.tsx';

import styles from './fonts-overview.module.css';

interface FontsOverviewProps {
  readonly page: FontsPage;
}

const usage = `@import '@earendil-works/elanor-fonts/earendil.css';
@import '@earendil-works/elanor-fonts/commit-mono.css';`;

const glyphs = [
  'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  'abcdefghijklmnopqrstuvwxyz',
  '0123456789 &@#%?!(){}[]',
];

/** Its children, separated by commas. */
function CommaList({children}: {readonly children: readonly ReactElement[]}): React.JSX.Element {
  return (
    <>
      {children.map((child, index) => (
        <Fragment key={child.key ?? index}>
          {index > 0 ? ', ' : null}
          {child}
        </Fragment>
      ))}
    </>
  );
}

function Fact({
  label,
  children,
}: {
  readonly label: string;
  readonly children: ReactNode;
}): React.JSX.Element {
  return (
    <>
      <KeyValue.Key>{label}</KeyValue.Key>
      <KeyValue.Value>{children}</KeyValue.Value>
    </>
  );
}

function Family({family}: {readonly family: FontFamily}): React.JSX.Element {
  const fontFamily = `"${family.name}"`;
  return (
    <section className={styles.section} aria-labelledby={family.id}>
      <Heading level={2} size={4} id={family.id}>
        {family.name}
      </Heading>
      <Text>{family.role}</Text>
      <div className={styles.specimen} style={{fontFamily}}>
        <p className={styles.sample}>{family.sample}</p>
        <p className={styles.glyphs}>
          {glyphs.map((line) => (
            <span key={line}>{line}</span>
          ))}
        </p>
        <dl className={styles.faces}>
          {family.faces.map((face) => (
            <div key={face.label} className={styles.face}>
              <dt>{face.label}</dt>
              <dd style={{fontWeight: face.weight, fontStyle: face.style}}>{family.sample}</dd>
            </div>
          ))}
        </dl>
      </div>
      <KeyValue.Grid className={styles.facts}>
        <Fact label="CSS family">
          <InlineCode>{family.name}</InlineCode>
        </Fact>
        <Fact label="Stylesheet">
          <InlineCode>{family.stylesheet}</InlineCode>
        </Fact>
        <Fact label="Files">{family.files}</Fact>
        {family.downloads.length > 0 ? (
          <Fact label="Desktop">
            OTF{' '}
            <CommaList>
              {family.downloads.map((download) => (
                <Link key={download.href} href={download.href} download data-astro-prefetch="false">
                  {download.label}
                </Link>
              ))}
            </CommaList>
          </Fact>
        ) : null}
        {family.usage.map((usage) => (
          <Fact key={usage.brand} label={`${usage.label} tokens`}>
            <span className={styles.usage}>
              {usage.styles.length > 0 ? (
                <span>
                  <CommaList>
                    {usage.styles.map((link) => (
                      <Link key={link.href} href={link.href}>
                        {link.label}
                      </Link>
                    ))}
                  </CommaList>
                </span>
              ) : null}
              {usage.tokens.length > 0 ? (
                <span>
                  <CommaList>
                    {usage.tokens.map((link) => (
                      <Link key={link.href} href={link.href}>
                        <code className={styles.code}>{link.label}</code>
                      </Link>
                    ))}
                  </CommaList>
                </span>
              ) : null}
            </span>
          </Fact>
        ))}
        <Fact label="License">
          <Link href={family.license.href}>{family.license.label}</Link>
        </Fact>
      </KeyValue.Grid>
    </section>
  );
}

/** Static HTML; `scripts/copy-buttons.ts` handles the copy button. */
export function FontsOverview({page}: FontsOverviewProps): React.JSX.Element {
  return (
    <>
      <section className={styles.use} aria-labelledby="use">
        <Heading level={2} size={4} id="use">
          Use
        </Heading>
        <Text>Import the fonts your brand uses, once, at the app’s entry.</Text>
        <CodeSnippet
          id="font-usage"
          actions={
            <StaticCopyButton
              value={usage}
              aria-label="Copy the example"
              aria-describedby="font-usage"
            />
          }
        >
          {usage}
        </CodeSnippet>
        <CopyStatus />
        <Text>
          Lefos: import <InlineCode>departure-mono.css</InlineCode> instead of{' '}
          <InlineCode>commit-mono.css</InlineCode>.
        </Text>
        {page.missing.map((font) => (
          <Text key={font.cssVariable}>
            <InlineCode>{font.cssVariable}</InlineCode> names {font.name}, which is not included.
          </Text>
        ))}
      </section>
      {page.families.map((family) => (
        <Family key={family.id} family={family} />
      ))}
    </>
  );
}
