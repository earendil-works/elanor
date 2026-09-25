import {CheckIcon} from '@earendil-works/elanor-icons-react/check';
import {ContentCopyIcon} from '@earendil-works/elanor-icons-react/content-copy';
import {forwardRef, useEffect, useRef, useState} from 'react';
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
    focusableWhenDisabled = false,
    children,
    'aria-label': label = 'Copy',
    title,
    ...props
  },
  ref,
) {
  const [status, setStatus] = useState<'idle' | 'copying' | 'copied' | 'error'>('idle');
  const request = useRef(0);

  useEffect(() => {
    setStatus('idle');
    return () => { request.current += 1; };
  }, [value]);

  useEffect(() => {
    if (status !== 'copied') return;
    const timeout = setTimeout(() => setStatus('idle'), 2000);
    return () => clearTimeout(timeout);
  }, [status]);

  async function copy(): Promise<void> {
    const currentRequest = ++request.current;
    setStatus('copying');
    try {
      await navigator.clipboard.writeText(value);
    } catch (error) {
      if (currentRequest !== request.current) return;
      setStatus('error');
      onCopyError?.(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    if (currentRequest !== request.current) return;
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
        disabled={disabled || status === 'copying'}
        focusableWhenDisabled={status === 'copying' || focusableWhenDisabled}
        data-copy-state={status}
        onClick={(event) => {
          onClick?.(event);
          if (!event.defaultPrevented && !event.baseUIHandlerPrevented && !disabled && status !== 'copying') {
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
