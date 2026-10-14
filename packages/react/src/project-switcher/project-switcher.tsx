import {Menu as BaseMenu} from '@base-ui/react/menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import type {ReactNode} from 'react';

import {mergeClassName} from '../utils/class-names.ts';

import styles from './project-switcher.module.css';

export interface ProjectSwitcherTriggerProps<Payload = unknown> extends Omit<
  BaseMenu.Trigger.Props<Payload>,
  'children'
> {
  /** The current project name. */
  readonly children?: ReactNode;
  /** Icon after the name. Pass `null` to hide it. */
  readonly indicator?: ReactNode;
}

export function ProjectSwitcherTrigger<Payload = unknown>({
  ref,
  children,
  indicator = <KeyboardArrowDownIcon aria-hidden="true" />,
  className,
  ...props
}: ProjectSwitcherTriggerProps<Payload>) {
  return (
    <BaseMenu.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Trigger.State>(styles.trigger, className)}
    >
      <span className={styles.label}>{children}</span>
      {indicator ? <span className={styles.indicator}>{indicator}</span> : null}
    </BaseMenu.Trigger>
  );
}
