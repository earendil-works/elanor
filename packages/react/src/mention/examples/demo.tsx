import {Mention, Text} from '@earendil-works/elanor-react';

export default function MentionDemo() {
  return (
    <Text>
      <Mention>@pi</Mention> the preview is cut off on Android. Can you take a look?
    </Text>
  );
}
