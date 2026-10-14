import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';
import styles from './code-snippet.module.css';
import {useSurfaceClassName} from '../appearance/appearance.tsx';
import {classes} from '../utils/class-names.ts';

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  readonly children?: ReactNode;
  readonly actions?: ReactNode;
}

export const CodeSnippet = forwardRef<HTMLPreElement, CodeSnippetProps>(function CodeSnippet(
  {children, actions, className, ...props},
  ref,
) {
  const surfaceClassName = useSurfaceClassName();
  return (
    <pre data-outline="box-small" data-outline-focus="control" {...props} ref={ref} className={classes(styles.root, surfaceClassName, className)}>
      <code data-surface-control="" className={styles.code}>{children}</code>
      {actions ? <span className={styles.actions}>{actions}</span> : null}
    </pre>
  );
});
