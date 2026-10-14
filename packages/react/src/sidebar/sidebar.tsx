import {Toggle} from '@base-ui/react/toggle';
import {Tooltip} from '@base-ui/react/tooltip';
import {useRender} from '@base-ui/react/use-render';
import {DockToLeftIcon} from '@earendil-works/elanor-icons-react';
import {createContext, useContext, useState, type ReactNode} from 'react';

import * as ScrollArea from '../scroll-area/index.ts';
import {classes, mergeClassName} from '../utils/class-names.ts';
import {CompactTooltip} from './compact-tooltip.tsx';

import styles from './sidebar.module.css';

export type SidebarState = {
  readonly collapsed: boolean;
};

export type SidebarChangeEventDetails = Toggle.ChangeEventDetails;
export type SidebarChangeEventReason = Toggle.ChangeEventReason;
export type SidebarTriggerState = Toggle.State;

export interface SidebarRootProps extends Omit<
  useRender.ComponentProps<'div', SidebarState>,
  'children'
> {
  /** Collapsed state, when controlled. */
  readonly collapsed?: boolean;
  /** Initial collapsed state, when uncontrolled. */
  readonly defaultCollapsed?: boolean;
  /** Called when the trigger toggles the sidebar. `details.cancel()` keeps the current state. */
  readonly onCollapsedChange?: (collapsed: boolean, details: SidebarChangeEventDetails) => void;
  /** Regions, or a function that receives `{collapsed}` and returns them. */
  readonly children?: ReactNode | ((state: SidebarState) => ReactNode);
}

interface SidebarContextValue {
  readonly state: SidebarState;
  readonly setCollapsed: (collapsed: boolean, details: SidebarChangeEventDetails) => void;
}

const SidebarContext = /* @__PURE__ */ createContext<SidebarContextValue | null>(null);

function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('Sidebar parts must be inside Sidebar.Root.');
  return context;
}

export function SidebarRoot({
  ref,
  collapsed: controlledCollapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  children,
  render,
  className,
  ...props
}: SidebarRootProps) {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(defaultCollapsed);
  const collapsed = controlledCollapsed ?? uncontrolledCollapsed;
  const state: SidebarState = {collapsed};
  const setCollapsed = (nextCollapsed: boolean, details: SidebarChangeEventDetails) => {
    onCollapsedChange?.(nextCollapsed, details);
    if (!details.isCanceled && controlledCollapsed === undefined) {
      setUncontrolledCollapsed(nextCollapsed);
    }
  };
  const element = useRender({
    defaultTagName: 'div',
    render,
    ref,
    state,
    props: {
      ...props,
      className: classes(styles.root, className),
      children: typeof children === 'function' ? children(state) : children,
    },
  });
  return (
    <SidebarContext.Provider value={{state, setCollapsed}}>
      <Tooltip.Provider>{element}</Tooltip.Provider>
    </SidebarContext.Provider>
  );
}

export interface SidebarTriggerProps extends Omit<
  Toggle.Props,
  'pressed' | 'defaultPressed' | 'onPressedChange'
> {}

export function SidebarTrigger({
  ref,
  className,
  children = <DockToLeftIcon aria-hidden="true" />,
  'aria-label': label = 'Collapse sidebar',
  ...props
}: SidebarTriggerProps) {
  const {state, setCollapsed} = useSidebarContext();
  return (
    <CompactTooltip label={label}>
      <Toggle
        {...props}
        ref={ref}
        aria-label={label}
        pressed={state.collapsed}
        onPressedChange={setCollapsed}
        className={mergeClassName<Toggle.State>(styles.trigger, className)}
      >
        {children}
      </Toggle>
    </CompactTooltip>
  );
}

export interface SidebarHeaderProps extends useRender.ComponentProps<'div', SidebarState> {}

export function SidebarHeader({ref, render, className, ...props}: SidebarHeaderProps) {
  const {state} = useSidebarContext();
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state,
    props: {...props, className: classes(styles.header, className)},
  });
}

export interface SidebarContentProps extends useRender.ComponentProps<'div', SidebarState> {}

export function SidebarContent({ref, render, className, children, ...props}: SidebarContentProps) {
  const {state} = useSidebarContext();
  // Keep render, ref, events and native attributes on the actual scrolling element.
  const viewport = useRender({
    defaultTagName: 'div',
    render,
    ref,
    state,
    props: {
      ...props,
      className: classes(styles.content, className),
      // Base UI uses min-width: fit-content for two-axis scrolling. Sidebar
      // navigation is single-axis: allow long labels to shrink and truncate.
      children: (
        <ScrollArea.Content className={styles.contentInner} style={{minWidth: 0}}>
          {children}
        </ScrollArea.Content>
      ),
    },
  });
  return (
    <ScrollArea.Root className={styles.scrollArea}>
      <ScrollArea.Viewport render={viewport} />
      <ScrollArea.Scrollbar className={styles.scrollbar}>
        <ScrollArea.Thumb />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
}

export interface SidebarFooterProps extends useRender.ComponentProps<'div', SidebarState> {}

export function SidebarFooter({ref, render, className, ...props}: SidebarFooterProps) {
  const {state} = useSidebarContext();
  return useRender({
    defaultTagName: 'div',
    render,
    ref,
    state,
    props: {...props, className: classes(styles.footer, className)},
  });
}
