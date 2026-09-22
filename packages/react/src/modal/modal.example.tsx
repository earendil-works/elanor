import {Button} from '../button/button.tsx';
import {Modal} from './modal.tsx';

export function ModalExample(): React.JSX.Element {
  return (
    <Modal.Root>
      <Modal.Trigger render={<Button />}>View project details</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup>
            <Modal.Title>Project details</Modal.Title>
            <Modal.Description>Settings shared by everyone in this workspace.</Modal.Description>
            <Modal.Body>New members inherit the project’s current access settings.</Modal.Body>
            <Modal.Actions>
              <Modal.Close render={<Button hierarchy="secondary" />}>Close</Modal.Close>
            </Modal.Actions>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
