import {CopyButton} from '@earendil-works/elanor-react';

export function CopyButtonExample(): React.JSX.Element {
  return (
    <p>
      <code>pnpm install</code>{' '}
      <CopyButton value="pnpm install" aria-label="Copy install command" />
    </p>
  );
}
