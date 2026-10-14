import {Grid, Heading, Section, Stack, Text} from '@earendil-works/elanor-react';

export default function SectionSeparatorSpan() {
  return (
    <Section.Root aria-labelledby="access-heading">
      <Section.Content>
        <Grid.Root>
          <Grid.Item span={{base: 'full', small: 6}}>
            <Stack gap="small">
              <Heading level={3} id="access-heading">
                Project access
              </Heading>
              <Text>Choose which projects each team can open.</Text>
            </Stack>
          </Grid.Item>
        </Grid.Root>
      </Section.Content>
      <Section.Separator span={{base: 'full', small: 6}} />
    </Section.Root>
  );
}
