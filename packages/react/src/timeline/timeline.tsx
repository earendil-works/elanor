import {ChevronRightIcon} from '@earendil-works/elanor-icons-react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  type ComponentPropsWithRef,
  type ReactNode,
  type RefObject,
} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './timeline.module.css';

/** Whether the root has rendered once: items mounted after that arrive. */
const ReadyContext = /* @__PURE__ */ createContext<RefObject<boolean> | null>(null);

export interface TimelineRootProps extends ComponentPropsWithRef<'ol'> {}

/**
 * A vertical list of steps on a rail, in order, such as the steps of a running task. Renders an `ol`. Items added after
 * the first render slide in.
 */
export function TimelineRoot({className, ...props}: TimelineRootProps) {
  const ready = useRef(false);
  useEffect(() => {
    ready.current = true;
  }, []);
  return (
    <ReadyContext value={ready}>
      <ol {...props} className={classes(styles.root, className)} />
    </ReadyContext>
  );
}

export type TimelineItemStatus = 'running' | 'done' | 'error';

const STATUS_LABELS: Record<TimelineItemStatus, string> = {
  running: 'Running',
  done: 'Done',
  error: 'Failed',
};

export interface TimelineItemProps extends Omit<
  ComponentPropsWithRef<'li'>,
  'title' | 'onClick' | 'children'
> {
  /**
   * The step's state. `running` colors the marker `semantic.color.icon.primary` and makes it breathe; `error` colors it
   * `semantic.color.icon.negative` and the description `semantic.color.text.negative`.
   * @default 'done'
   */
  status?: TimelineItemStatus | undefined;
  /**
   * The marker's accessible name.
   * @default 'Running', 'Done' or 'Failed', by status
   */
  statusLabel?: string | undefined;
  /** The marker, such as an icon for the kind of step. A small dot without one. */
  icon?: ReactNode;
  /** The step's title, on one line, truncated with an ellipsis. */
  title: ReactNode;
  /** A line below the title, truncated with an ellipsis. */
  description?: ReactNode;
  /** Sets the description in the code font, for commands and output. */
  code?: boolean | undefined;
  /** Makes the step a button with a trailing chevron, for steps that open more detail. */
  onClick?: (() => void) | undefined;
}

/** One step: a marker on the rail beside its title, and an optional description. Renders an `li`. */
export function TimelineItem({
  status = 'done',
  statusLabel,
  icon,
  title,
  description,
  code = false,
  onClick,
  className,
  ref,
  ...props
}: TimelineItemProps) {
  const ready = useContext(ReadyContext);
  const element = useRef<HTMLLIElement | null>(null);
  const itemRef = useCallback(
    (node: HTMLLIElement | null) => {
      element.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    [ref],
  );
  // An item mounted after the timeline first rendered slides in.
  useLayoutEffect(() => {
    if (ready?.current) {
      element.current?.setAttribute('data-arriving', '');
    }
  }, [ready]);
  const content = (
    <>
      <span
        className={styles.marker}
        data-status={status}
        role="img"
        aria-label={statusLabel ?? STATUS_LABELS[status]}
      >
        {icon ?? <span className={styles.dot} />}
      </span>
      <span className={styles.body}>
        <span className={styles.text}>
          <span className={styles.title}>{title}</span>
          {description != null && description !== false && (
            <span className={styles.description} data-code={code || undefined}>
              {description}
            </span>
          )}
        </span>
        {onClick && (
          <span className={styles.chevron}>
            <ChevronRightIcon />
          </span>
        )}
      </span>
    </>
  );
  return (
    <li {...props} ref={itemRef} className={classes(styles.item, className)} data-status={status}>
      {onClick ? (
        <button type="button" className={styles.step} onClick={() => onClick()}>
          {content}
        </button>
      ) : (
        <div className={styles.step}>{content}</div>
      )}
    </li>
  );
}
