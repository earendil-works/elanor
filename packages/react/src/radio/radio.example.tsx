import {Radio} from './radio.tsx';

export function RadioExample(): React.JSX.Element {
  return (
    <Radio.Group defaultValue="one" aria-label="Options">
      <Radio.Root value="one" aria-label="One">
        <Radio.Indicator />
      </Radio.Root>
      <Radio.Root value="two" aria-label="Two">
        <Radio.Indicator />
      </Radio.Root>
    </Radio.Group>
  );
}
