import type {BaseUIChangeEventDetails} from '@base-ui/react/types';

/**
 * Builds change event details as Base UI's components do, typed against the public type, so a shape
 * change fails the type check.
 */
export function createChangeEventDetails<
  Reason extends string,
  Custom extends object = Record<never, never>,
>(
  reason: Reason,
  event: BaseUIChangeEventDetails<Reason>['event'] | undefined,
  trigger?: Element,
  custom?: Custom,
): BaseUIChangeEventDetails<Reason, Custom> {
  let canceled = false;
  let propagationAllowed = false;
  const details = {
    reason,
    event: event ?? new Event('base-ui'),
    trigger,
    cancel() {
      canceled = true;
    },
    allowPropagation() {
      propagationAllowed = true;
    },
    get isCanceled() {
      return canceled;
    },
    get isPropagationAllowed() {
      return propagationAllowed;
    },
    ...custom,
  };
  // SAFETY: the public type distributes over `Reason`, which an object built for a generic reason
  // can't be checked against. Without an event, `event` is `new Event('base-ui')`, as Base UI's own
  // factory makes it, so it isn't the reason's specific event type then.
  return details as BaseUIChangeEventDetails<Reason, Custom>;
}
