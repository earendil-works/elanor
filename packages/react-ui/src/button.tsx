'use client';

import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef} from 'react';
import styles from './button.module.css';
import {classes, mergeClassName} from './shared.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'small' | 'medium';

export interface ButtonProps extends Omit<BaseButton.Props, 'nativeButton' | 'render'> {
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly pending?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'secondary',
    size = 'medium',
    pending = false,
    disabled = false,
    focusableWhenDisabled = false,
    type = 'button',
    className,
    ...props
  },
  ref,
) {
  const componentClassName = classes(
    styles.root,
    styles[variant],
    size === 'small' && styles.small,
  );

  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || pending}
      focusableWhenDisabled={focusableWhenDisabled || pending}
      aria-busy={pending || props['aria-busy']}
      className={mergeClassName<BaseButton.State>(componentClassName, className)}
    />
  );
});
