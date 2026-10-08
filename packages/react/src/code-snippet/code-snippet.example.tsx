import {CopyButton} from '../copy-button/copy-button.tsx';
import {CodeSnippet} from './code-snippet.tsx';

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
