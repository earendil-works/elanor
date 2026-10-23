import {Link} from '@earendil-works/elanor-react';

import styles from './skip-link.module.css';

/** Targets the element with `id="main"`. */
export function SkipLink(): React.JSX.Element {
  return (
    <Link href="#main" className={`visually-hidden ${styles.skipLink}`}>
      Skip to content
    </Link>
  );
}
