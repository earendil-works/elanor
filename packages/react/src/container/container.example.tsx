import {Heading} from '../heading/heading.tsx';
import {Stack} from '../stack/stack.tsx';
import {Text} from '../text/text.tsx';
import {Container} from './container.tsx';

export function ContainerExample() {
  return (
    <Stack align="stretch" style={{inlineSize: '100%'}}>
      <Container render={<section aria-labelledby="capped-container" />}>
        <Heading level={2} id="capped-container">Capped content</Heading>
        <Text>The default cap stays centered within its parent, including the space remaining after a sidebar.</Text>
      </Container>
      <Container width="full" render={<section aria-labelledby="full-container" />}>
        <Heading level={2} id="full-container">Full-width content</Heading>
        <Text>No content cap, with the same inline gutters. These examples look alike when the parent is narrower than the cap.</Text>
      </Container>
    </Stack>
  );
}
