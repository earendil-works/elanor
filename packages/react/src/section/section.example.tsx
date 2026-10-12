import {Heading, Section, Text} from '@earendil-works/elanor-react';

export function SectionSeparatedExample(): React.JSX.Element {
  return (
    // This was the second MDX sibling, before hydration introduced an island boundary.
    <Section aria-labelledby="members-heading" data-stroke-variant="1">
      <Heading level={2} id="members-heading">Members</Heading>
      <Text>Invite collaborators and assign workspace roles.</Text>
    </Section>
  );
}

export function SectionUnseparatedExample(): React.JSX.Element {
  return (
    <Section separated={false} aria-labelledby="access-heading" data-stroke-variant="3">
      <Heading level={2} id="access-heading">Project access</Heading>
      <Text>Choose which projects each team can access.</Text>
    </Section>
  );
}
