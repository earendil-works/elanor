import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef} from 'react';
import styles from './button.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export type {ButtonState} from '@base-ui/react/button';

export type ButtonHierarchy = 'primary' | 'secondary' | 'tertiary';
export type ButtonSemantic = 'neutral' | 'information' | 'negative' | 'positive';
export type ButtonDensity = 'compact' | 'default';

export interface ButtonProps extends BaseButton.Props {
  readonly hierarchy?: ButtonHierarchy;
  readonly semantic?: ButtonSemantic;
  readonly density?: ButtonDensity;
  readonly pending?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    hierarchy,
    semantic,
    density,
    pending = false,
    disabled = false,
    focusableWhenDisabled = false,
    type = 'button',
    className,
    ...props
  },
  ref,
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled || pending}
      focusableWhenDisabled={focusableWhenDisabled || pending}
      aria-busy={pending || props['aria-busy']}
      data-density={density ?? 'default'}
      data-hierarchy={hierarchy ?? 'primary'}
      data-semantic={semantic ?? 'neutral'}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    />
  );
});
