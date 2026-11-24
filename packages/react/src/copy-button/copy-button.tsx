import type {Button as BaseButton} from '@base-ui/react/button';
import {CheckIcon, ContentCopyIcon, ErrorIcon} from '@earendil-works/elanor-icons-react';
import {useEffect, useRef, useState, useSyncExternalStore, type ReactNode} from 'react';

import {announce} from '../announce/announce.ts';
import {Button} from '../button/button.tsx';
import {
  IconButton,
  type IconButtonDensity,
  type IconButtonProps,
} from '../icon-button/icon-button.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './copy-button.module.css';

export interface CopyButtonProps extends Omit<IconButtonProps, 'value'> {
  /**
   * Text written to the clipboard, or a function that returns it when the button is pressed, for
   * values only known in the browser, such as an absolute URL.
   */
  readonly value: string | (() => string);
  /** Visible text after the icon. Without it, the button shows only the icon. */
  readonly children?: ReactNode;
  /** Defaults to "Copy" when the button shows only the icon. */
  readonly 'aria-label'?: string | undefined;
  /** Defaults to `compact` without text, `default` with it. */
  readonly density?: IconButtonDensity;
  /** Icon before copying, replaced by a check or an error icon. Defaults to the copy icon. */
  readonly icon?: ReactNode;
  /** Announced after a successful copy. */
  readonly copiedLabel?: string;
  /** Announced when copying fails. */
  readonly errorLabel?: string;
  readonly onCopySuccess?: () => void;
  readonly onCopyError?: (error: Error) => void;
  /** Your own behavior names for the button, for `enhance`, attached after the copy button's. */
  readonly 'data-elanor'?: string;
  /**
   * A link the behavior copies as an absolute URL on static pages, for a `value` that is a function.
   */
  readonly 'data-elanor-copy-link'?: string;
}

type CopyState = 'idle' | 'copied' | 'error';

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
  hierarchy = 'tertiary',
  'aria-label': ariaLabel,
  title,
  'data-elanor': pageBehaviors,
  'data-elanor-copy-link': copyLink,
  ...props
}: CopyButtonProps) {
  const [state, setState] = useState<CopyState>('idle');
  const resetTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // The behavior's contract is only rendered on the server and dropped once React hydrates, so the
  // behavior stands down and client renders don't repeat the value in the DOM.
  const rendersContract = useSyncExternalStore(
    subscribeToNothing,
    () => false,
    () => true,
  );

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  function show(result: 'copied' | 'error', button: HTMLElement, duration: number): void {
    setState(result);
    announce(result === 'copied' ? copiedLabel : errorLabel, button);
    clearTimeout(resetTimer.current);
    // Errors stay until the next press, so they aren't missed.
    if (result === 'copied') resetTimer.current = setTimeout(() => setState('idle'), duration);
  }

  async function copy(button: HTMLElement): Promise<void> {
    // Minified CSS may write the token in seconds.
    const token = getComputedStyle(button).getPropertyValue('--semantic-duration-confirmation');
    const duration = Number.parseFloat(token) * (token.trim().endsWith('ms') ? 1 : 1000) || 2000;
    try {
      await navigator.clipboard.writeText(typeof value === 'function' ? value() : value);
    } catch (error) {
      show('error', button, duration);
      onCopyError?.(error instanceof Error ? error : new Error(String(error)));
      return;
    }
    show('copied', button, duration);
    onCopySuccess?.();
  }

  const handleClick: NonNullable<IconButtonProps['onClick']> = (event) => {
    onClick?.(event);
    if (!event.defaultPrevented && !event.baseUIHandlerPrevented && !disabled) {
      void copy(event.currentTarget);
    }
  };

  const iconOnly = children == null || typeof children === 'boolean' || children === '';
  const name = ariaLabel ?? (iconOnly ? 'Copy' : undefined);
  const hint = title ?? (iconOnly ? name : undefined);
  const feedback = state === 'copied' ? copiedLabel : state === 'error' ? errorLabel : '';
  const buttonProps = {
    ...props,
    ref,
    hierarchy,
    'aria-label': name,
    // Matches copy-button.behavior.ts: the result replaces an existing title but never adds one.
    title: hint ? feedback || hint : hint,
    disabled,
    className: mergeClassName<BaseButton.State>(styles.button, className),
    'data-copy-state': state,
    'data-elanor': classes(rendersContract && 'copy-button', pageBehaviors) || undefined,
    'data-elanor-copy-value': rendersContract && typeof value === 'string' ? value : undefined,
    'data-elanor-copy-link': rendersContract ? copyLink : undefined,
    'data-elanor-copied-label': rendersContract ? copiedLabel : undefined,
    'data-elanor-error-label': rendersContract ? errorLabel : undefined,
    onClick: handleClick,
  };
  const icons = (
    <>
      {icon}
      <CheckIcon className={styles.copiedIcon} />
      <ErrorIcon className={styles.errorIcon} />
    </>
  );

  return iconOnly ? (
    <IconButton {...buttonProps}>{icons}</IconButton>
  ) : (
    <Button {...buttonProps} iconStart={icons}>
      {children}
    </Button>
  );
}
