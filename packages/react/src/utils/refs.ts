import {useCallback, useLayoutEffect, useRef, type Ref, type RefCallback} from 'react';

/** One ref callback that sets both refs, such as a part's own ref and the one passed to it. */
export function useMergedRef<T>(a: Ref<T> | undefined, b: Ref<T> | undefined): RefCallback<T> {
  return useCallback(
    (element: T) => {
      const cleanups = [setRef(a, element), setRef(b, element)];
      return () => {
        for (const cleanup of cleanups) cleanup();
      };
    },
    [a, b],
  );
}

/**
 * A ref callback that keeps its identity while `ref` changes, as an inline callback does on every
 * render, so the refs merged with it stay attached. A new `ref` gets the element after the commit.
 */
export function useStableRef<T>(ref: Ref<T> | undefined): RefCallback<T> {
  const latest = useRef(ref);
  const attached = useRef<{
    readonly element: T;
    readonly ref: typeof ref;
    readonly detach: () => void;
  }>(undefined);
  useLayoutEffect(() => {
    latest.current = ref;
    const current = attached.current;
    if (!current || current.ref === ref) return;
    current.detach();
    attached.current = {element: current.element, ref, detach: setRef(ref, current.element)};
  }, [ref]);
  return useCallback((element: T) => {
    attached.current = {element, ref: latest.current, detach: setRef(latest.current, element)};
    return () => {
      attached.current?.detach();
      attached.current = undefined;
    };
  }, []);
}

/** Sets a ref and returns how to unset it, following React 19's ref cleanup functions. */
function setRef<T>(ref: Ref<T> | undefined, element: T): () => void {
  // React's `Ref` union is only told apart at runtime, and Base UI has no public ref merger.
  if (typeof ref === 'function') {
    const cleanup = ref(element);
    return cleanup ?? (() => ref(null));
  }
  if (ref) ref.current = element;
  return () => {
    if (ref) ref.current = null;
  };
}
