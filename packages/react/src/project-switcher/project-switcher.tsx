import {Menu as BaseMenu} from '@base-ui/react/menu';
import {KeyboardArrowDownIcon} from '@earendil-works/elanor-icons-react';
import {forwardRef, type ReactNode, type Ref, type RefAttributes} from 'react';
import {Menu} from '../menu/menu.tsx';
import styles from './project-switcher.module.css';
import outline from '../utils/outline.module.css';
import {classes, mergeClassName} from '../utils/class-names.ts';

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
      data-outline="box-small"
      data-outline-band="none"
      {...props}
      ref={ref}
      className={mergeClassName<BaseMenu.Trigger.State>(
        classes(styles.trigger, outline.outline),
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
