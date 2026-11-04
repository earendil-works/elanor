import {Search, Stack} from '@earendil-works/elanor-react';

export default function SearchDensity() {
  return (
    <Stack align="stretch">
      <Search aria-label="Search projects, default" placeholder="Default" />
      <Search density="compact" aria-label="Search projects, compact" placeholder="Compact" />
    </Stack>
  );
}
