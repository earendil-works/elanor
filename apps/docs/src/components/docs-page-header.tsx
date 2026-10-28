import {CheckIcon, ContentCopyIcon} from '@earendil-works/elanor-icons-boiled-react';
import {Button, Heading, Separator} from '@earendil-works/elanor-react';

import {formatCalendarDate} from '../lib/last-updated.ts';

interface DocsPageHeaderProps {
  readonly title: string;
  /** Site-relative path of the page's Markdown version, such as `/components/button.md`. */
  readonly markdown?: string | undefined;
  /** When the page last changed, as an ISO 8601 date. */
  readonly lastUpdated?: string | undefined;
}

/** The page title, when the page last changed, and a button that copies its Markdown version. */
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
          {/* `scripts/copy-page.ts` copies the Markdown and shows the result. */}
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
