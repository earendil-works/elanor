/** @jsxImportSource react */
import {Card} from '@earendil-works/elanor-react';

/** Links to the previous and the next page in the navigation's order, as linked cards. */

export interface PagerLink {
  readonly href: string;
  readonly title: string;
}

export function DocsPager({
  previous,
  next,
}: {
  readonly previous?: PagerLink | undefined;
  readonly next?: PagerLink | undefined;
}): React.JSX.Element | null {
  if (!previous && !next) return null;
  return (
    <nav className="docs-pager" aria-label="Previous and next page">
      {previous ? (
        <Card
          render={<a href={previous.href} rel="prev" />}
          className="docs-pager-link docs-pager-previous"
          label="Previous"
          value={previous.title}
        />
      ) : null}
      {next ? (
        <Card
          render={<a href={next.href} rel="next" />}
          className="docs-pager-link docs-pager-next"
          label="Next"
          value={next.title}
        />
      ) : null}
    </nav>
  );
}
