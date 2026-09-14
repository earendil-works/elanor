import {Menu as BaseMenu} from '@base-ui/react/menu';
import {forwardRef, type ReactNode} from 'react';
import {ContextualMenu} from '../contextual-menu/contextual-menu.tsx';
import styles from './project-switcher.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

export interface ProjectSwitcherTriggerProps extends Omit<BaseMenu.Trigger.Props, 'children'> {
  readonly children?: ReactNode;
  readonly indicator?: ReactNode;
  readonly outlined?: boolean;
}

export const ProjectSwitcherTrigger = forwardRef<
  HTMLButtonElement,
  ProjectSwitcherTriggerProps
>(function ProjectSwitcherTrigger(
  {children, indicator, outlined = false, className, ...props},
  ref,
) {
  return (
    <BaseMenu.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Trigger.State>(
        classes(styles.trigger, outlined && styles.outlined),
        className,
      )}
    >
      <span className={styles.label}>{children}</span>
      {indicator ? <span className={styles.indicator}>{indicator}</span> : null}
    </BaseMenu.Trigger>
  );
});

export const ProjectSwitcher = {
  Root: ContextualMenu.Root,
  Trigger: ProjectSwitcherTrigger,
  Portal: ContextualMenu.Portal,
  Positioner: ContextualMenu.Positioner,
  Popup: ContextualMenu.Popup,
  Item: ContextualMenu.Item,
  LinkItem: ContextualMenu.LinkItem,
  Group: ContextualMenu.Group,
  GroupLabel: ContextualMenu.GroupLabel,
  Separator: ContextualMenu.Separator,
} as const;
