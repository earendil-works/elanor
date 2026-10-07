import {Grid, Heading, Section, Stack, Text} from '@earendil-works/elanor-react';

export function SectionExample() {
  return (
    <Stack align="stretch" gap="large">
      <Section.Root aria-labelledby="members-heading">
        <Section.Content>
          <Grid.Root>
            <Grid.Item span={{base: 'full', small: 6}}>
              <Stack gap="small">
                <Heading level={2} id="members-heading">Members</Heading>
                <Text>Invite collaborators and assign workspace roles.</Text>
              </Stack>
            </Grid.Item>
          </Grid.Root>
        </Section.Content>
        <Section.Separator span={{base: 'full', small: 6}} />
      </Section.Root>

      <Section.Root aria-labelledby="access-heading">
        <Section.Content>
          <Stack gap="small">
            <Heading level={2} id="access-heading">Project access</Heading>
            <Text>Choose which projects each team can access. The separator spans all twelve columns.</Text>
          </Stack>
        </Section.Content>
        <Section.Separator />
      </Section.Root>

      <Section.Root aria-labelledby="notifications-heading">
        <Section.Content>
          <Stack gap="small">
            <Heading level={2} id="notifications-heading">Notifications</Heading>
            <Text>This section has no separator and no trailing padding.</Text>
          </Stack>
        </Section.Content>
      </Section.Root>
    </Stack>
  );
}
