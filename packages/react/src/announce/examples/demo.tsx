import {announce, Button} from '@earendil-works/elanor-react';

export default function AnnounceDemo() {
  return (
    <Button
      hierarchy="secondary"
      onClick={(event) => announce('Draft saved.', event.currentTarget)}
    >
      Save draft
    </Button>
  );
}
