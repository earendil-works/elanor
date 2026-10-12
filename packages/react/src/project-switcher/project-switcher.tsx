import {Menu as BaseMenu} from '@base-ui/react/menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import type {ReactNode} from 'react';

import {Menu} from '../menu/index.ts';
import {mergeClassName} from '../utils/class-names.ts';

import styles from './project-switcher.module.css';

export interface ProjectSwitcherTriggerProps<Payload = unknown> extends Omit<
  BaseMenu.Trigger.Props<Payload>,
  'children'
> {
  readonly children?: ReactNode;
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

export const ProjectSwitcher = {
  Root: Menu.Root,
  Trigger: ProjectSwitcherTrigger,
  Portal: Menu.Portal,
  Positioner: Menu.Positioner,
  Popup: Menu.Popup,
  Item: Menu.Item,
  LinkItem: Menu.LinkItem,
  Group: Menu.Group,
  GroupLabel: Menu.GroupLabel,
  Separator: Menu.Separator,
} as const;
