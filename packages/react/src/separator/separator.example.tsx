import {Separator, Stack, Text} from '@earendil-works/elanor-react';

export function VerticalSeparatorExample(): React.JSX.Element {
  return (
    <Stack
      direction="row"
      align="center"
      gap="medium"
      style={{blockSize: 'var(--semantic-dimension-size-medium)'}}
    >
      <Text render={<span />}>12 projects</Text>
      <Separator orientation="vertical" />
      <Text render={<span />}>3 teams</Text>
    </Stack>
  );
}
