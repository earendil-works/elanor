import {Container, Text} from '@earendil-works/elanor-react';

// The outline only marks the content box for this demo.
const outline = {
  outline:
    'var(--semantic-dimension-border-width-default) dashed var(--semantic-color-border-primary)',
};

export default function ContainerDemo() {
  return (
    <Container>
      <Text style={outline}>Centered content, capped at 1216px, with 16px gutters.</Text>
    </Container>
  );
}
