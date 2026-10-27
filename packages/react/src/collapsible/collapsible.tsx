import {Collapsible as BaseCollapsible} from '@base-ui/react/collapsible';
import {
  createContext,
  useContext,
  useId,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type Ref,
} from 'react';

export type {
  CollapsibleRootState,
  CollapsibleRootChangeEventReason,
  CollapsibleRootChangeEventDetails,
  CollapsibleTriggerState,
  CollapsiblePanelState,
} from '@base-ui/react/collapsible';

export type CollapsibleRootProps = BaseCollapsible.Root.Props;
export type CollapsibleTriggerProps = BaseCollapsible.Trigger.Props;
export type CollapsiblePanelProps = BaseCollapsible.Panel.Props;

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

export interface CollapsibleStaticRootProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /** Whether the panel is open when the page loads. */
  readonly defaultOpen?: boolean;
  /**
   * Remembers whether the panel is open in the browser's local storage under this key, and
   * restores it when the behavior attaches.
   */
  readonly persist?: string;
}

/**
 * A collapsible for pages rendered on the server without React in the browser. It renders the
 * markup of `Root`, `Trigger`, and `Panel`, and `createCollapsible` opens and closes it. Put a
 * `StaticTrigger` and a `StaticPanel` inside.
 */
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

/** Opens and closes the panel. */
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

export interface CollapsibleStaticPanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly ref?: Ref<HTMLDivElement> | undefined;
  /**
   * Lets the browser's find in page search the closed panel and open it on a match, through
   * `hidden="until-found"`. Without the behavior, the closed panel is hidden.
   */
  readonly hiddenUntilFound?: boolean;
}

/** The content that opens and closes. */
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
      // React renders only a plain `hidden`; the behavior turns it into `hidden="until-found"`.
      hidden={!open}
      data-open={open ? '' : undefined}
      data-closed={open ? undefined : ''}
      data-elanor-hidden-until-found={hiddenUntilFound ? '' : undefined}
    />
  );
}
