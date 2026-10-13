import {Text} from './text.tsx';

export function TextInlineExample(): React.JSX.Element {
  return (
    <p>
      Project visibility: <Text render={<span />}>Private</Text>
    </p>
  );
}
