import {Button as BaseButton} from '@base-ui/react/button';
import type {ReactNode} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './button.module.css';

export type {ButtonState} from '@base-ui/react/button';

export type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary';
export type ButtonSemantic = 'neutral' | 'negative' | 'positive';
export type ButtonDensity = 'compact' | 'default';

export interface ButtonProps extends BaseButton.Props {
  /** Visual emphasis. Use one `primary` button per view. */
  readonly hierarchy?: ButtonHierarchy;
  /** `negative` for destructive actions, `positive` for confirming ones. */
  readonly semantic?: ButtonSemantic;
  /** `compact` removes block padding but keeps the touch target height. */
  readonly density?: ButtonDensity;
  /** Decorative icon before the label. */
  readonly iconStart?: ReactNode;
  /** Decorative icon after the label. */
  readonly iconEnd?: ReactNode;
  /** Disables the button while an action runs, keeps it focusable, and sets `aria-busy`. */
  readonly pending?: boolean;
}

export function Button({
  ref,
  hierarchy = 'primary',
  semantic = 'neutral',
  density = 'default',
  iconStart,
  iconEnd,
  pending = false,
  disabled = false,
  focusableWhenDisabled = false,
  type = 'button',
  className,
  ...props
}: ButtonProps) {
  const contentProps =
    iconStart || iconEnd
      ? {
          children: (
            <>
              {iconStart ? (
                <span className={styles.icon} aria-hidden="true">
                  {iconStart}
                </span>
              ) : null}
              {props.children}
              {iconEnd ? (
                <span className={styles.icon} aria-hidden="true">
                  {iconEnd}
                </span>
              ) : null}
            </>
          ),
        }
      : {};

  return (
    <BaseButton
      {...props}
      {...contentProps}
      ref={ref}
      type={type}
      disabled={disabled || pending}
      focusableWhenDisabled={focusableWhenDisabled || pending}
      aria-busy={pending || props['aria-busy']}
      data-density={density}
      data-icon-start={iconStart ? '' : undefined}
      data-icon-end={iconEnd ? '' : undefined}
      data-hierarchy={hierarchy}
      data-semantic={semantic}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    />
  );
}
