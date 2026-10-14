import {Link, Stack} from '@earendil-works/elanor-react';

export function LinkExample(): React.JSX.Element {
  return (
    <Stack gap="small">
      <Link href="/components/button">Browse button examples</Link>
      {/* MDX emitted a paragraph for this multiline link; keep its original margins. */}
      <Link href="https://base-ui.com/react/overview/quick-start" target="_blank" rel="noreferrer">
        <p>Base UI documentation (opens in a new tab)</p>
      </Link>
    </Stack>
  );
}
