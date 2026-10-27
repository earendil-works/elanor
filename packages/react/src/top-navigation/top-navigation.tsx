import {Button as BaseButton} from '@base-ui/react/button';
import type {AnchorHTMLAttributes, HTMLAttributes, Ref} from 'react';

import {classes, mergeClassName} from '../utils/class-names.ts';

import styles from './top-navigation.module.css';

export interface TopNavigationRootProps extends HTMLAttributes<HTMLElement> {
  readonly ref?: Ref<HTMLElement> | undefined;
}

export function TopNavigationRoot({ref, className, ...props}: TopNavigationRootProps) {
  return <header {...props} ref={ref} className={classes(styles.root, className)} />;
}

export interface TopNavigationIdentityProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationIdentity({ref, className, ...props}: TopNavigationIdentityProps) {
  return <div {...props} ref={ref} className={classes(styles.identity, className)} />;
}

export interface TopNavigationNavigationProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationNavigation({ref, className, ...props}: TopNavigationNavigationProps) {
  return <div {...props} ref={ref} className={classes(styles.navigation, className)} />;
}

export interface TopNavigationLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly ref?: Ref<HTMLAnchorElement> | undefined;
  /**
   * Marks the current page or section with `aria-current="page"`. Router links that set
   * `aria-current` themselves need no `active`.
   */
  readonly active?: boolean;
}

/** A link in the bar's navigation. */
export function TopNavigationLink({
  ref,
  active = false,
  className,
  children,
  ...props
}: TopNavigationLinkProps) {
  return (
    <a
      {...props}
      ref={ref}
      aria-current={active ? 'page' : props['aria-current']}
      className={classes(styles.link, className)}
    >
      {children}
    </a>
  );
}

export interface TopNavigationActionsProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function TopNavigationActions({ref, className, ...props}: TopNavigationActionsProps) {
  return <div {...props} ref={ref} className={classes(styles.actions, className)} />;
}

export interface TopNavigationActionButtonProps extends BaseButton.Props {}

/** An icon button in the bar, styled like the menu's trigger. Name it with `aria-label`. */
export function TopNavigationActionButton({
  ref,
  type = 'button',
  className,
  ...props
}: TopNavigationActionButtonProps) {
  return (
    <BaseButton
      {...props}
      ref={ref}
      type={type}
      className={mergeClassName<BaseButton.State>(styles.actionButton, className)}
    />
  );
}
