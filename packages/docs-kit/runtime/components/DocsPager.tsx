/** @jsxImportSource react */
import {ChevronLeftIcon} from '@earendil-works/elanor-icons-react/chevron-left';
import {ChevronRightIcon} from '@earendil-works/elanor-icons-react/chevron-right';

/** Links to the previous and the next page in the navigation's order, below a separator. */

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
        <a href={previous.href} rel="prev" className="docs-pager-link docs-pager-previous">
          <span className="docs-pager-label">Previous</span>
          <span className="docs-pager-title">
            <ChevronLeftIcon />
            {previous.title}
          </span>
        </a>
      ) : null}
      {next ? (
        <a href={next.href} rel="next" className="docs-pager-link docs-pager-next">
          <span className="docs-pager-label">Next</span>
          <span className="docs-pager-title">
            {next.title}
            <ChevronRightIcon />
          </span>
        </a>
      ) : null}
    </nav>
  );
}
