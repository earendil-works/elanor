import {CheckIcon, ContentCopyIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef, useEffect, useState} from 'react';
import {IconButton, type IconButtonProps} from '../icon-button/icon-button.tsx';
import styles from './copy-button.module.css';

export interface CopyButtonProps extends Omit<IconButtonProps, 'value'> {
  readonly value: string;
  readonly copiedLabel?: string;
  readonly errorLabel?: string;
  readonly onCopySuccess?: () => void;
  readonly onCopyError?: (error: Error) => void;
}

export const CopyButton = forwardRef<HTMLButtonElement, CopyButtonProps>(function CopyButton(
  {
    value,
    copiedLabel = 'Copied.',
    errorLabel = 'Could not copy. Try again or copy manually.',
    onCopySuccess,
    onCopyError,
    onClick,
    disabled,
    children,
    'aria-label': label = 'Copy',
    title,
    ...props
  },
  ref,
) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'error'>('idle');

  useEffect(() => {
    if (status !== 'copied') return;
    const timeout = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timeout);
  }, [status]);

  async function copy(): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
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
        data-copy-state={status}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !event.baseUIHandlerPrevented && !disabled) {
            void copy();
          }
        }}
      >
        {children ?? (status === 'copied' ? <CheckIcon /> : <ContentCopyIcon />)}
      </IconButton>
      <span role="status" className={styles.status}>{feedback}</span>
    </>
  );
});
