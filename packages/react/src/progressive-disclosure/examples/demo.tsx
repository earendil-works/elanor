import {Button, ProgressiveDisclosure, Text} from '@earendil-works/elanor-react';

export default function ProgressiveDisclosureDemo() {
  return (
    <ProgressiveDisclosure.Root>
      <ProgressiveDisclosure.Trigger render={<Button hierarchy="secondary" />}>
        Show billing details
      </ProgressiveDisclosure.Trigger>
      <ProgressiveDisclosure.Panel>
        <Text>Invoices are sent on the first day of each month to the billing contact.</Text>
      </ProgressiveDisclosure.Panel>
    </ProgressiveDisclosure.Root>
  );
}
