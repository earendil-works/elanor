import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef} from 'react';
import styles from './icon-button.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface IconButtonProps extends BaseButton.Props {}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {disabled = false, type = 'button', className, children, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    >
      {/* The visible surface is smaller than the target. */}
      <span className={classes(styles.surface, surfaceClassName)} data-outline="box-small" data-outline-focus="parent" aria-hidden="true" />
      {children}
    </BaseButton>
  );
});
