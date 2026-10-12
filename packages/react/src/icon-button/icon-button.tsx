import {Button as BaseButton} from '@base-ui/react/button';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './icon-button.module.css';

export interface IconButtonProps extends BaseButton.Props {}

export function IconButton({
  ref,
  disabled = false,
  type = 'button',
  className,
  ...props
}: IconButtonProps) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      disabled={disabled}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    />
  );
}
