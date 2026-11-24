import {ArrowForwardIcon} from '@earendil-works/elanor-icons-react';
import {ButtonLink, Stack} from '@earendil-works/elanor-react';

// Demo only: link to real URLs instead of `#`.
export default function ButtonLinkDemo() {
  return (
    <Stack direction="row" gap="small" wrap="wrap">
      <ButtonLink href="#" iconEnd={<ArrowForwardIcon />}>
        Open dashboard
      </ButtonLink>
      <ButtonLink href="#" hierarchy="secondary">
        Read the guide
      </ButtonLink>
    </Stack>
  );
}
