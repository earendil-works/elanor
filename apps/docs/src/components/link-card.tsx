import {Card, Heading} from '@earendil-works/elanor-react';
import type {ReactNode} from 'react';

import styles from './link-card.module.css';

interface LinkCardProps {
  readonly href: string;
  readonly title: ReactNode;
  readonly level?: 2 | 3 | 4;
  readonly children?: ReactNode;
}

/** A card that is one link. */
export function LinkCard({href, title, level = 3, children}: LinkCardProps): React.JSX.Element {
  return (
    // oxlint-disable-next-line jsx-a11y/control-has-associated-label -- Card renders the title and text into the link.
    <Card className={styles.card} render={<a href={href} />}>
      <Heading level={level} size={6}>
        {title}
      </Heading>
      {children ? <div className={styles.body}>{children}</div> : null}
    </Card>
  );
}
