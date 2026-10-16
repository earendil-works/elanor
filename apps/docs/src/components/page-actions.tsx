import {
  ArticleIcon,
  CheckIcon,
  ContentCopyIcon,
  KeyboardArrowDownIcon,
  LinkIcon,
} from '@earendil-works/elanor-icons-boiled-react';
import {Button, Menu} from '@earendil-works/elanor-react';
import {useRef, useState} from 'react';

import styles from './page-actions.module.css';

interface PageActionsProps {
  /** Site-relative path of the page's Markdown version, such as `/components/button.md`. */
  readonly markdownPath: string;
  /** Production URL of the same file. */
  readonly markdownUrl: string;
}

/** Copies the page's Markdown, or a link to it, for pasting into an agent. */
export function PageActions({markdownPath, markdownUrl}: PageActionsProps): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Takes a pending value so Safari keeps the click's user activation while the Markdown loads.
  async function copy(text: string | Promise<string>): Promise<void> {
    try {
      await navigator.clipboard.write([new ClipboardItem({'text/plain': text})]);
    } catch {
      // Like shadcn/ui: a failed copy leaves the button unchanged.
      return;
    }
    setCopied(true);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          render={
            <Button
              hierarchy="secondary"
              iconStart={copied ? <CheckIcon /> : <ContentCopyIcon />}
              iconEnd={<KeyboardArrowDownIcon />}
            />
          }
        >
          {copied ? 'Copied' : 'Copy'}
        </Menu.Trigger>
        <Menu.Portal>
          <Menu.Positioner align="end">
            <Menu.Popup>
              <Menu.Item
                icon={<ArticleIcon />}
                onClick={() =>
                  void copy(
                    fetch(markdownPath).then((response) => {
                      if (!response.ok) throw new Error(`${response.status} ${markdownPath}`);
                      return response.text();
                    }),
                  )
                }
              >
                Copy page
              </Menu.Item>
              <Menu.Item icon={<LinkIcon />} onClick={() => void copy(markdownUrl)}>
                Copy Markdown link
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
      <span role="status" className={styles.status}>
        {copied ? 'Copied.' : ''}
      </span>
    </>
  );
}
