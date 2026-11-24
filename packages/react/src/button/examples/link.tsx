import {ArrowForwardIcon} from '@earendil-works/elanor-icons-react';
import {ButtonLink, Stack} from '@earendil-works/elanor-react';

// Demo only; in your code, the links point to real URLs.
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
