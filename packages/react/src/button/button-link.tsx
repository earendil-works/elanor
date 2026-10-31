import type {AnchorHTMLAttributes, Ref} from 'react';

import {classes} from '../utils/class-names.ts';
import {ButtonContent} from './button-content.tsx';
import type {ButtonProps} from './button.tsx';

import styles from './button.module.css';

export interface ButtonLinkProps
  extends
    AnchorHTMLAttributes<HTMLAnchorElement>,
    Pick<ButtonProps, 'hierarchy' | 'semantic' | 'density' | 'iconStart' | 'iconEnd'> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
}

/**
 * A link that looks like a Button, for navigation such as a call to action. Renders a plain `a`
 * without a button role, and passes its props and ref through, so a router can wrap it.
 */
export function ButtonLink({
  ref,
  hierarchy = 'primary',
  semantic = 'neutral',
  density = 'default',
  iconStart,
  iconEnd,
  className,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      {...props}
      ref={ref}
      data-density={density}
      data-icon-start={iconStart ? '' : undefined}
      data-icon-end={iconEnd ? '' : undefined}
      data-hierarchy={hierarchy}
      data-semantic={semantic}
      className={classes(styles.root, className)}
    >
      <ButtonContent iconStart={iconStart} iconEnd={iconEnd}>
        {children}
      </ButtonContent>
    </a>
  );
}
