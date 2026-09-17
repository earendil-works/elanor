import {Modal} from './modal.tsx';

export function ModalExample(): React.JSX.Element {
  return (
    <Modal.Root>
      <Modal.Trigger>Open modal</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup>
            <Modal.Title>Modal title</Modal.Title>
            <Modal.Description>Modal description</Modal.Description>
            <Modal.Body>Modal body</Modal.Body>
            <Modal.Actions>
              <Modal.Close>Close</Modal.Close>
            </Modal.Actions>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
