import {Link} from '@earendil-works/elanor-react';

export default function LinkExternal() {
  return (
    <Link href="https://example.com/status" target="_blank" rel="noreferrer">
      Service status (opens in a new tab)
    </Link>
  );
}
