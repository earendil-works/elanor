/** @jsxImportSource react */
import {CheckIcon} from '@earendil-works/elanor-icons-react/check';
import {ContentCopyIcon} from '@earendil-works/elanor-icons-react/content-copy';
import {Button, Heading, Separator} from '@earendil-works/elanor-react';

/*
 * The page's title and its metadata: when it last changed, and a button that copies its Markdown
 * (`scripts/copy-page.ts`).
 */

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * A date as `D MMM YYYY` in UTC, such as `1 Sep 2026`, like Elanor's docs and pi.dev.
 * `Intl.DateTimeFormat` is not used because some locales abbreviate September as "Sept".
 */
export function formatCalendarDate(date: Date): string {
  return `${date.getUTCDate()} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
}

interface DocsPageHeaderProps {
  readonly title: string;
  /** The address of the page's Markdown. */
  readonly markdown?: string | undefined;
  /** When the page last changed, as an ISO 8601 date. */
  readonly lastUpdated?: string | undefined;
}

export function DocsPageHeader({
  title,
  markdown,
  lastUpdated,
}: DocsPageHeaderProps): React.JSX.Element {
  return (
    <header className="docs-page-header">
      <Heading level={1} size={1}>
        {title}
      </Heading>
      {markdown || lastUpdated ? (
        <div className="docs-page-metadata">
          {lastUpdated ? (
            <span className="docs-page-updated">
              Last updated{' '}
              <time dateTime={lastUpdated}>{formatCalendarDate(new Date(lastUpdated))}</time>
            </span>
          ) : null}
          {markdown && lastUpdated ? (
            <Separator orientation="vertical" className="docs-page-metadata-separator" />
          ) : null}
          {markdown ? (
            <>
              <Button
                hierarchy="tertiary"
                iconStart={
                  <>
                    <ContentCopyIcon />
                    <CheckIcon />
                  </>
                }
                title="Copy this page as Markdown"
                className="docs-copy-page"
                data-elanor="copy-page"
                data-copy-state="idle"
                data-docs-copy-page={markdown}
                data-docs-copied-label="Page copied as Markdown."
                data-docs-error-label="Could not copy the page. Try again."
              >
                Copy page
              </Button>
              <span role="status" className="visually-hidden" />
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
