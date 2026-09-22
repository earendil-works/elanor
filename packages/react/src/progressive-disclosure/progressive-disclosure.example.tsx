import {Button} from '../button/button.tsx';
import {Field} from '../field/field.tsx';
import {Input} from '../input/input.tsx';
import {ProgressiveDisclosure} from './progressive-disclosure.tsx';

export function ProgressiveDisclosureExample(): React.JSX.Element {
  return (
    <ProgressiveDisclosure.Root defaultOpen>
      <ProgressiveDisclosure.Trigger render={<Button hierarchy="secondary" />}>
        Advanced options
      </ProgressiveDisclosure.Trigger>
      <ProgressiveDisclosure.Panel keepMounted>
        <Field.Root name="deployment-region">
          <Field.Label>Deployment region</Field.Label>
          <Input defaultValue="eu-central-1" />
        </Field.Root>
      </ProgressiveDisclosure.Panel>
    </ProgressiveDisclosure.Root>
  );
}
