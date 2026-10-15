import {Container, Heading, Text} from '@earendil-works/elanor-react';

// The outline only marks the content box for this demo.
const outline = {
  outline:
    'var(--semantic-dimension-border-width-default) dashed var(--semantic-color-border-primary)',
};

export default function ContainerCustomElement() {
  return (
    <Container
      render={<section aria-labelledby="reading-title" />}
      style={{maxInlineSize: 'var(--semantic-dimension-size-max-width-content-small)'}}
    >
      <div style={outline}>
        <Heading level={3} id="reading-title">
          Release notes
        </Heading>
        <Text>A narrower reading column, rendered as a named section.</Text>
      </div>
    </Container>
  );
}
