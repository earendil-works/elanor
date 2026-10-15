import {InlineCode, Text} from '@earendil-works/elanor-react';

export default function InlineCodeOutput() {
  return (
    <Text>
      If the build prints <InlineCode render={<samp />}>Error: missing token</InlineCode>, run the
      generator again.
    </Text>
  );
}
