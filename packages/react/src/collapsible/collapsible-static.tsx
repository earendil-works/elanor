import type {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {
  createContext,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type Ref,
} from 'react';

interface StaticCollapsibleContextValue {
  readonly open: boolean;
  readonly panelId: string;
}

const StaticCollapsibleContext =
  /* @__PURE__ */ createContext<StaticCollapsibleContextValue | null>(null);

function useStaticCollapsible(part: string): StaticCollapsibleContextValue {
  const collapsible = useContext(StaticCollapsibleContext);
  if (!collapsible) throw new Error(`Collapsible.${part} must be inside Collapsible.StaticRoot.`);
  return collapsible;
}

export interface CollapsibleStaticRootProps
  extends HTMLAttributes<HTMLDivElement>, Pick<BaseCollapsible.Root.Props, 'defaultOpen'> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Remembers whether the panel is open in local storage under this key. */
  readonly persist?: string;
}

/** A collapsible for pages without React in the browser; `createCollapsible` makes it work. */
export function CollapsibleStaticRoot({
  ref,
  defaultOpen = false,
  persist,
  ...props
}: CollapsibleStaticRootProps) {
  const panelId = useId();
  return (
    <StaticCollapsibleContext.Provider value={{open: defaultOpen, panelId}}>
      <div
        {...props}
        ref={ref}
        data-elanor="collapsible"
        data-elanor-persist={persist}
        data-open={defaultOpen ? '' : undefined}
        data-closed={defaultOpen ? undefined : ''}
      />
    </StaticCollapsibleContext.Provider>
  );
}

export interface CollapsibleStaticTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly ref?: Ref<HTMLButtonElement> | undefined;
}

export function CollapsibleStaticTrigger({ref, ...props}: CollapsibleStaticTriggerProps) {
  const {open, panelId} = useStaticCollapsible('StaticTrigger');
  return (
    <button
      type="button"
      {...props}
      ref={ref}
      aria-expanded={open}
      aria-controls={panelId}
      data-panel-open={open ? '' : undefined}
    />
  );
}

export interface CollapsibleStaticPanelProps
  extends HTMLAttributes<HTMLDivElement>, Pick<BaseCollapsible.Panel.Props, 'hiddenUntilFound'> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

export function CollapsibleStaticPanel({
  ref,
  hiddenUntilFound = false,
  ...props
}: CollapsibleStaticPanelProps) {
  const {open, panelId} = useStaticCollapsible('StaticPanel');
  return (
    <div
      {...props}
      ref={ref}
      id={panelId}
      // React can't render `hidden="until-found"`; the behavior sets it.
      hidden={!open}
      data-open={open ? '' : undefined}
      data-closed={open ? undefined : ''}
      data-elanor-hidden-until-found={hiddenUntilFound ? '' : undefined}
    />
  );
}
