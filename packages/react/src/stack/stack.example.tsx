import {Heading, Stack, Text} from '@earendil-works/elanor-react';

const statusStyle = {
  padding: 'var(--semantic-dimension-space-padding-small)',
  borderRadius: 'var(--semantic-dimension-radius-small)',
  background: 'var(--semantic-color-background-fill-secondary)',
};

export function StackExample(): React.JSX.Element {
  return (
    <Stack gap="large" style={{inlineSize: '100%'}}>
      {([
        {label: 'Column: default start', direction: 'column', align: undefined},
        {label: 'Column: explicit stretch', direction: 'column', align: 'stretch'},
        {label: 'Row: default start', direction: 'row', align: undefined},
        {label: 'Row: explicit stretch', direction: 'row', align: 'stretch'},
      ] as const).map(({label, direction, align}) => (
        <section key={label}>
          <Heading level={2}>{label}</Heading>
          <Stack direction={direction} align={align} gap="small" role="group" aria-label={label}>
            <Text as="span" style={statusStyle}>Draft</Text>
            <Text as="span" style={statusStyle}>Ready for review<br />2 comments</Text>
          </Stack>
        </section>
      ))}
      <section>
        <Heading level={2}>Column: auto gap</Heading>
        <Stack gap="auto" style={{minBlockSize: '12rem'}} role="group" aria-label="Column: auto gap">
          <Text as="span" style={statusStyle}>Draft</Text>
          <Text as="span" style={statusStyle}>Review</Text>
          <Text as="span" style={statusStyle}>Ready</Text>
        </Stack>
      </section>
      <section style={{inlineSize: '100%'}}>
        <Heading level={2}>Row: auto gap</Heading>
        <Stack direction="row" gap="auto" role="group" aria-label="Row: auto gap">
          <Text as="span" style={statusStyle}>Draft</Text>
          <Text as="span" style={statusStyle}>Review</Text>
          <Text as="span" style={statusStyle}>Ready</Text>
        </Stack>
      </section>
    </Stack>
  );
}
