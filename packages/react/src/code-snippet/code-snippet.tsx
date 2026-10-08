import {forwardRef, type HTMLAttributes, type ReactNode} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './code-snippet.module.css';

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  readonly children?: ReactNode;
  readonly actions?: ReactNode;
}

export const CodeSnippet = forwardRef<HTMLPreElement, CodeSnippetProps>(function CodeSnippet(
  {children, actions, className, ...props},
  ref,
) {
  return (
    <pre {...props} ref={ref} className={classes(styles.root, className)}>
      <code className={styles.code}>{children}</code>
      {actions ? <span className={styles.actions}>{actions}</span> : null}
    </pre>
  );
});
