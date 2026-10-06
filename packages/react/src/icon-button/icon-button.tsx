import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef} from 'react';
import styles from './icon-button.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface IconButtonProps extends BaseButton.Props {}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {disabled = false, type = 'button', className, children, ...props},
  ref,
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    >
      {/* The visible surface is smaller than the target, and carries the outline. */}
      <span className={classes(styles.surface, outline.outline)} data-outline="box-small" aria-hidden="true" />
      {children}
    </BaseButton>
  );
});
