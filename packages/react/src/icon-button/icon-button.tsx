import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef} from 'react';
import styles from './icon-button.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export interface IconButtonProps extends BaseButton.Props {}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {disabled = false, type = 'button', className, ...props},
  ref,
) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    />
  );
});
