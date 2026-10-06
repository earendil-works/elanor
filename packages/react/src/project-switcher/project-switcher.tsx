import {Menu as BaseMenu} from '@base-ui/react/menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef, type ReactNode, type Ref, type RefAttributes} from 'react';
import {ContextualMenu} from '../contextual-menu/contextual-menu.tsx';
import styles from './project-switcher.module.css';
import {mergeClassName} from '../utils/class-names.ts';

export interface ProjectSwitcherTriggerProps<Payload = unknown>
  extends Omit<BaseMenu.Trigger.Props<Payload>, 'children'> {
  readonly children?: ReactNode;
  readonly indicator?: ReactNode;
}

export const ProjectSwitcherTrigger = forwardRef(function ProjectSwitcherTrigger<Payload>(
  {children, indicator = <KeyboardArrowDownIcon aria-hidden="true" />, className, ...props}: ProjectSwitcherTriggerProps<Payload>,
  ref: Ref<HTMLButtonElement>,
) {
  return (
    <BaseMenu.Trigger
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Trigger.State>(
        styles.trigger,
        className,
      )}
    >
      <span className={styles.label}>{children}</span>
      {indicator ? <span className={styles.indicator}>{indicator}</span> : null}
    </BaseMenu.Trigger>
  );
}) as <Payload = unknown>(
  props: Omit<ProjectSwitcherTriggerProps<Payload>, 'ref'> & RefAttributes<HTMLButtonElement>,
) => React.JSX.Element;

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
