import {useCallback, type Ref, type RefCallback} from 'react';

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
