import type {HTMLAttributes, ReactNode, Ref} from 'react';

import {classes} from '../utils/class-names.ts';

import styles from './code-snippet.module.css';

export interface CodeSnippetProps extends Omit<HTMLAttributes<HTMLPreElement>, 'children'> {
  readonly ref?: Ref<HTMLPreElement> | undefined;
  readonly children?: ReactNode;
  readonly actions?: ReactNode;
}

export function CodeSnippet({ref, children, actions, className, ...props}: CodeSnippetProps) {
  return (
    <pre {...props} ref={ref} className={classes(styles.root, className)}>
      <code className={styles.code}>{children}</code>
      {actions ? <span className={styles.actions}>{actions}</span> : null}
    </pre>
  );
}
