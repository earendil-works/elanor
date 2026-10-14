import {Heading, Section, Stack, Text} from '@earendil-works/elanor-react';

export default function SectionDemo() {
  return (
    <Section.Root aria-labelledby="members-heading">
      <Section.Content>
        <Stack gap="small">
          <Heading level={2} id="members-heading">
            Members
          </Heading>
          <Text>Invite collaborators and assign workspace roles.</Text>
        </Stack>
      </Section.Content>
      <Section.Separator />
    </Section.Root>
  );
}
