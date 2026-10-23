import {IconButton} from '@earendil-works/elanor-react';

import styles from './static-copy-button.module.css';

interface StaticCopyButtonProps {
  /** Text written to the clipboard. */
  readonly value: string;
  readonly 'aria-label'?: string;
  /** The element that names what is copied, such as the code next to the button. */
  readonly 'aria-describedby'?: string;
}

/**
 * A copy button that renders as static HTML, for pages that list many values. `scripts/copy-buttons.ts`
 * copies `data-copy-value` and announces the result in the page's `[data-copy-status]` region, with the same
 * labels and timing as CopyButton. The icons are shared SVG masks, not inline SVG per button.
 */
export function StaticCopyButton({
  value,
  'aria-label': label = 'Copy',
  'aria-describedby': describedBy,
}: StaticCopyButtonProps): React.JSX.Element {
  return (
    <IconButton
      className={styles.button}
      aria-label={label}
      aria-describedby={describedBy}
      title={label}
      data-copy-value={value}
      data-copy-state="idle"
    >
      <span
        aria-hidden="true"
        className={styles.icon}
        data-icon="copy"
        style={{maskImage: 'url(/api/icons/content-copy.svg)'}}
      />
      <span
        aria-hidden="true"
        className={styles.icon}
        data-icon="copied"
        style={{maskImage: 'url(/api/icons/check.svg)'}}
      />
    </IconButton>
  );
}

/** The live region that copy buttons announce in; render one per page. */
export function CopyStatus(): React.JSX.Element {
  return <span role="status" className={styles.status} data-copy-status />;
}
