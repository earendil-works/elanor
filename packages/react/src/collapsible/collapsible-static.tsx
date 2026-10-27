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
  /** The page's own behaviors for this element, attached after the component's. */
  readonly 'data-elanor'?: string;
  readonly ref?: Ref<HTMLDivElement> | undefined;
}

/** A collapsible for pages without React in the browser; `createCollapsible` makes it work. */
export function CollapsibleStaticRoot({
  'data-elanor': pageBehaviors,
  ref,
  defaultOpen = false,
  ...props
}: CollapsibleStaticRootProps) {
  const panelId = useId();
  return (
    <StaticCollapsibleContext.Provider value={{open: defaultOpen, panelId}}>
      <div
        {...props}
        ref={ref}
        data-elanor={pageBehaviors ? `collapsible ${pageBehaviors}` : 'collapsible'}
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
