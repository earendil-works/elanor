import {Button as BaseButton} from '@base-ui/react/button';
import {forwardRef, type ReactNode} from 'react';
import styles from './social-login.module.css';
import {useBrushVariant} from '../brush-border/use-brush-variant.ts';
import {mergeClassName} from '../utils/class-names.ts';

export interface SocialLoginProps extends BaseButton.Props {
  readonly icon?: ReactNode;
}

export const SocialLogin = forwardRef<HTMLButtonElement, SocialLoginProps>(
  function SocialLogin({icon, children, className, type = 'button', ...props}, ref) {
    return (
      <BaseButton
        data-brush-variant={useBrushVariant()}
        {...props}
        ref={ref}
        type={type}
        className={mergeClassName<BaseButton.State>(styles.root, className)}
      >
        {icon ? <span className={styles.icon}>{icon}</span> : null}
        <span className={styles.label}>{children}</span>
      </BaseButton>
    );
  },
);
