import {Separator, Stack, Text} from '@earendil-works/elanor-react';

export function SeparatorHorizontalExample(): React.JSX.Element {
  return (
    <Stack gap="medium" style={{inlineSize: '100%'}}>
      <Text>Account settings</Text>
      <Separator />
      <Text>Workspace settings</Text>
    </Stack>
  );
}

export function SeparatorVerticalExample(): React.JSX.Element {
  return (
    <Stack direction="row" align="center" gap="medium" style={{blockSize: 'var(--semantic-dimension-size-medium)'}}>
      <Text as="span">12 projects</Text>
      <Separator orientation="vertical" />
      <Text as="span">3 teams</Text>
    </Stack>
  );
}
