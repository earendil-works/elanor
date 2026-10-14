import {Button as BaseButton} from '@base-ui/react/button';
import type {ReactNode} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './social-login.module.css';

export interface SocialLoginProps extends BaseButton.Props {
  /** The provider's logo, before the label. */
  readonly icon?: ReactNode;
}

export function SocialLogin({
  ref,
  icon,
  children,
  className,
  type = 'button',
  ...props
}: SocialLoginProps) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      className={mergeClassName<BaseButton.State>(styles.root, className)}
    >
      {icon ? <span className={styles.icon}>{icon}</span> : null}
      <span className={styles.label}>{children}</span>
    </BaseButton>
  );
}
