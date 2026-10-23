import {IconButton} from '@earendil-works/elanor-react';

import styles from './static-copy-button.module.css';

interface StaticCopyButtonProps {
  /** Text written to the clipboard. */
  readonly value: string;
  readonly 'aria-label'?: string;
  /** The element that shows what is copied. */
  readonly 'aria-describedby'?: string;
}

/**
 * CopyButton without hydration, for pages with many values; `scripts/copy-buttons.ts` handles it.
 * The icons are shared SVG masks, not inline SVG per button.
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

/** The live region for copy results; render one per page. */
export function CopyStatus(): React.JSX.Element {
  return <span role="status" className={styles.status} data-copy-status />;
}
