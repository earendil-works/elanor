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
  /** The page's own behaviors for the wrapper, attached after the linked heading's. */
  readonly 'data-elanor'?: string;
};

/**
 * A heading followed by a button that copies the heading's link and moves the page to it. The
 * button shows on hover, on keyboard focus, after a tap or click on the heading, and while it
 * confirms a copy. `ref` and the heading props go to the heading; `className` goes to the wrapper.
 */
export function LinkedHeading({
  id,
  linkLabel,
  copiedLabel = 'Link copied.',
  'data-elanor': pageBehaviors,
  className,
  ...props
}: LinkedHeadingProps) {
  return (
    <div
      className={classes(styles.root, className)}
      data-elanor={pageBehaviors ? `linked-heading ${pageBehaviors}` : 'linked-heading'}
    >
      {/* Focusable without joining the tab order, so a tap on the heading reveals the button. */}
      <Heading tabIndex={-1} {...props} id={id} className={styles.heading} />
      <CopyButton
        value={() => new URL(`#${id}`, window.location.href).href}
        icon={<LinkIcon />}
        aria-label={linkLabel}
        copiedLabel={copiedLabel}
        className={styles.button}
        data-elanor-copy-link={`#${id}`}
        onClick={() => {
          window.location.hash = id;
        }}
      />
    </div>
  );
}
