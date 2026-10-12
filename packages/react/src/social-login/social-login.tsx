import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef, type ReactNode} from 'react';
import styles from './social-login.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface SocialLoginProps extends BaseButton.Props {
  readonly icon?: ReactNode;
}

export const SocialLogin = forwardRef<HTMLButtonElement, SocialLoginProps>(
  function SocialLogin({icon, children, className, type = 'button', ...props}, ref) {
    const surfaceClassName = useSurfaceClassName();
    return (
      <BaseButton
        data-outline="box-small"
        data-outline-focus="self"
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseButton.State>(classes(styles.root, surfaceClassName), className)}
      >
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{children}</span>
      </BaseButton>
    );
  },
);
