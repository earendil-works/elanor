/** @jsxImportSource react */
import {Link} from '@earendil-works/elanor-react';

/** Targets the element with `id="main"`. */
export function SkipLink(): React.JSX.Element {
  return (
    <Link href="#main" className="visually-hidden docs-skip-link">
      Skip to content
    </Link>
  );
}
