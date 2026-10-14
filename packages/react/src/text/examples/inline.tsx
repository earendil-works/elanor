import {Text} from '@earendil-works/elanor-react';

export default function TextInline() {
  return (
    <p>
      Project visibility: <Text render={<span />}>Private</Text>
    </p>
  );
}
