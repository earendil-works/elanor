import type {Button as BaseButton} from '@base-ui/react/button';
import {CheckIcon, ContentCopyIcon} from '@earendil-works/elanor-icons-react';
import {useEffect, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';

import {IconButton, type IconButtonProps} from '../icon-button/icon-button.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './copy-button.module.css';

export interface CopyButtonProps extends Omit<IconButtonProps, 'value'> {
  /**
   * Text written to the clipboard, or a function that returns it when the button is pressed, for
   * values only known in the browser, such as an absolute URL.
   */
  readonly value: string | (() => string);
  /** Icon shown before copying; a check replaces it after a copy. Defaults to the copy icon. */
  readonly icon?: ReactNode;
  /** Announced after a successful copy. */
  readonly copiedLabel?: string;
  /** Announced when copying fails. */
  readonly errorLabel?: string;
  readonly onCopySuccess?: () => void;
  readonly onCopyError?: (error: Error) => void;
  /** The page's own behaviors for the button, attached after the copy button's. */
  readonly 'data-elanor'?: string;
}

function subscribeToNothing(): () => void {
  return () => {};
}

export function CopyButton({
  ref,
  value,
  icon = <ContentCopyIcon />,
  copiedLabel = 'Copied.',
  errorLabel = 'Could not copy. Try again or copy manually.',
  onCopySuccess,
  onCopyError,
  onClick,
  disabled,
  className,
  children,
  'aria-label': label = 'Copy',
  'data-elanor': pageBehaviors,
  title,
  ...props
}: CopyButtonProps) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const confirmationDuration = useRef(0);
  // The behavior's contract is only rendered on the server and dropped once React hydrates, so the
  // behavior stands down and client renders don't repeat the value in the DOM.
  const rendersContract = useSyncExternalStore(
    subscribeToNothing,
    () => false,
    () => true,
  );

  useEffect(() => {
    if (status !== 'copied') return;
    const timeout = setTimeout(() => setStatus('idle'), confirmationDuration.current);
    return () => clearTimeout(timeout);
  }, [status]);

  async function copy(button: HTMLElement): Promise<void> {
    // Minified CSS may write the token in seconds.
    const token = getComputedStyle(button).getPropertyValue('--semantic-duration-confirmation');
    const duration = Number.parseFloat(token) * (token.trim().endsWith('ms') ? 1 : 1000) || 2000;
    confirmationDuration.current = duration;
    try {
      await navigator.clipboard.writeText(typeof value === 'function' ? value() : value);
    } catch (error) {
      setStatus('error');
      onCopyError?.(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    setStatus('copied');
    onCopySuccess?.();
  }

  const feedback = status === 'copied' ? copiedLabel : status === 'error' ? errorLabel : '';

  return (
    <>
      <IconButton
        {...props}
        ref={ref}
        aria-label={label}
        title={feedback || title || label}
        disabled={disabled}
        className={mergeClassName<BaseButton.State>(styles.button, className)}
        data-copy-state={status}
        data-elanor={classes(rendersContract && 'copy-button', pageBehaviors) || undefined}
        data-elanor-copy-value={rendersContract && typeof value === 'string' ? value : undefined}
        data-elanor-copied-label={rendersContract ? copiedLabel : undefined}
        data-elanor-error-label={rendersContract ? errorLabel : undefined}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !event.baseUIHandlerPrevented && !disabled) {
            void copy(event.currentTarget);
          }
        }}
      >
        {children ?? (
          <>
            {icon}
            <CheckIcon className={styles.copiedIcon} />
          </>
        )}
      </IconButton>
      <span role="status" className={styles.status}>
        {feedback}
      </span>
    </>
  );
}
