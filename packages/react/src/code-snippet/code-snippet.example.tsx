import {CopyButton, CodeSnippet} from '@earendil-works/elanor-react';

import styles from './code-snippet.example.module.css';

const code = 'pnpm install';

export function CodeSnippetCopyExample(): React.JSX.Element {
  return (
    <CodeSnippet
      className={styles.example}
      actions={<CopyButton value={code} aria-label="Copy code" />}
    >
      {code}
    </CodeSnippet>
  );
}
