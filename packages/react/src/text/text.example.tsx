import {Text} from '@earendil-works/elanor-react';

export function TextParagraphExample(): React.JSX.Element {
  return (
    <Text>Keep your team’s projects, shared documents, and decisions in one place.</Text>
  );
}

export function TextInlineExample(): React.JSX.Element {
  return (
    <p>Project visibility: <Text as="span">Private</Text></p>
  );
}
