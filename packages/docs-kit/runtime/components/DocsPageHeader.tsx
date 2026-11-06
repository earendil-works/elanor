/** @jsxImportSource react */
import {CheckIcon} from '@earendil-works/elanor-icons-react/check';
import {ContentCopyIcon} from '@earendil-works/elanor-icons-react/content-copy';
import {EditIcon} from '@earendil-works/elanor-icons-react/edit';
import {Button, ButtonLink, Heading, Separator} from '@earendil-works/elanor-react';
import {Fragment, type ReactNode} from 'react';

/*
 * The page's title and its metadata: when it last changed, a link that edits it on GitHub, and a
 * button that copies its Markdown (`scripts/copy-page.ts`).
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
  /** The address that edits the page's Markdown. */
  readonly editUrl?: string | undefined;
}

export function DocsPageHeader({
  title,
  markdown,
  lastUpdated,
  editUrl,
}: DocsPageHeaderProps): React.JSX.Element {
  const items: {key: string; node: ReactNode}[] = [];
  if (lastUpdated) {
    items.push({
      key: 'updated',
      node: (
        <span className="docs-page-updated">
          Last updated{' '}
          <time dateTime={lastUpdated}>{formatCalendarDate(new Date(lastUpdated))}</time>
        </span>
      ),
    });
  }
  if (editUrl) {
    items.push({
      key: 'edit',
      node: (
        <ButtonLink
          href={editUrl}
          hierarchy="tertiary"
          iconStart={<EditIcon />}
          className="docs-page-action"
        >
          Edit page
        </ButtonLink>
      ),
    });
  }
  if (markdown) {
    items.push({
      key: 'copy',
      node: (
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
            className="docs-page-action docs-copy-page"
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
      ),
    });
  }
  return (
    <header className="docs-page-header">
      <Heading level={1} size={1}>
        {title}
      </Heading>
      {items.length > 0 ? (
        <div className="docs-page-metadata">
          {items.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 ? (
                <Separator orientation="vertical" className="docs-page-metadata-separator" />
              ) : null}
              {item.node}
            </Fragment>
          ))}
        </div>
      ) : null}
    </header>
  );
}
