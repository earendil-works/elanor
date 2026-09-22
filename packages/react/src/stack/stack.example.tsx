import {Heading} from '../heading/heading.tsx';
import {Text} from '../text/text.tsx';
import {Stack} from './stack.tsx';

const statusStyle = {
  padding: 'var(--semantic-dimension-space-padding-small)',
  borderRadius: 'var(--semantic-dimension-radius-small)',
  background: 'var(--semantic-color-background-fill-secondary)',
};

export function StackExample(): React.JSX.Element {
  return (
    <Stack gap="large">
      {([
        {label: 'Column: default start', direction: 'column', align: undefined},
        {label: 'Column: explicit stretch', direction: 'column', align: 'stretch'},
        {label: 'Row: default start', direction: 'row', align: undefined},
        {label: 'Row: explicit stretch', direction: 'row', align: 'stretch'},
      ] as const).map(({label, direction, align}) => (
        <section key={label}>
          <Heading level={2}>{label}</Heading>
          <Stack direction={direction} align={align} gap="small" role="group" aria-label={label}>
            <Text style={statusStyle}>Draft</Text>
            <Text style={statusStyle}>Ready for review<br />2 comments</Text>
          </Stack>
        </section>
      ))}
    </Stack>
  );
}
