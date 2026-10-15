import {InlineCode, Text} from '@earendil-works/elanor-react';

export default function InlineCodeDemo() {
  return (
    <Text>
      Run <InlineCode>pnpm install</InlineCode> after changing <InlineCode>package.json</InlineCode>
      .
    </Text>
  );
}
