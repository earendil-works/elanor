import {LinkIcon} from '@earendil-works/elanor-icons-react';

import {CopyButton} from '../copy-button/copy-button.tsx';
import {Heading, type HeadingProps} from '../heading/heading.tsx';
import {classes} from '../utils/class-names.ts';

import styles from './linked-heading.module.css';

export type LinkedHeadingProps = HeadingProps & {
  /** The heading's id, the target of its link. */
  readonly id: string;
  /** Accessible name of the link button, such as "Copy link to Billing". */
  readonly linkLabel: string;
  /** Announced after the link is copied. */
  readonly copiedLabel?: string;
};

/**
 * A heading followed by a button that copies the heading's link and moves the page to it. The
 * button shows on hover, on keyboard focus, and after a copy with a mouse, and always on touch
 * screens. `ref` and the heading props go to the heading; `className` goes to the wrapper.
 */
export function LinkedHeading({
  id,
  linkLabel,
  copiedLabel = 'Link copied.',
  className,
  ...props
}: LinkedHeadingProps) {
  return (
    <div className={classes(styles.root, className)}>
      <Heading {...props} id={id} className={styles.heading} />
      <CopyButton
        value={() => new URL(`#${id}`, window.location.href).href}
        icon={<LinkIcon />}
        aria-label={linkLabel}
        copiedLabel={copiedLabel}
        className={styles.button}
        onClick={() => {
          window.location.hash = id;
        }}
      />
    </div>
  );
}
