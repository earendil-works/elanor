import {Link} from '@earendil-works/elanor-react';
import type {AnchorHTMLAttributes} from 'react';

import type {SiteMark} from '../lib/site-mark.ts';

import styles from './site-identity.module.css';

interface SiteIdentityProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly mark: SiteMark;
}

export function SiteIdentity({mark, className, ...props}: SiteIdentityProps): React.JSX.Element {
  return (
    <Link
      href="/"
      aria-label="Elanor home"
      {...props}
      className={className ? `${styles.identity} ${className}` : styles.identity}
    >
      <img
        className={styles.mark}
        src={mark.src}
        srcSet={mark.srcSet}
        width={mark.width}
        height={mark.height}
        alt=""
      />
      <span>Elanor</span>
    </Link>
  );
}
