import {ProgressiveDisclosure} from './progressive-disclosure.tsx';

export function ProgressiveDisclosureExample(): React.JSX.Element {
  return (
    <ProgressiveDisclosure.Root defaultOpen>
      <ProgressiveDisclosure.Trigger>More details</ProgressiveDisclosure.Trigger>
      <ProgressiveDisclosure.Panel>Additional details</ProgressiveDisclosure.Panel>
    </ProgressiveDisclosure.Root>
  );
}
