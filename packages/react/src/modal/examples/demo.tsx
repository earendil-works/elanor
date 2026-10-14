import {CloseIcon} from '@earendil-works/elanor-icons-react';
import {Button, IconButton, Modal, Stack} from '@earendil-works/elanor-react';

export default function ModalDemo() {
  return (
    <Modal.Root>
      <Modal.Trigger render={<Button hierarchy="secondary" />}>Rename project</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup>
            <Stack direction="row" align="start" gap="auto">
              <Modal.Title>Rename project</Modal.Title>
              <Modal.Close render={<IconButton aria-label="Close" />}>
                <CloseIcon />
              </Modal.Close>
            </Stack>
            <Modal.Description>Members see the new name right away.</Modal.Description>
            <Modal.Body>The project URL stays the same, so existing links keep working.</Modal.Body>
            <Modal.Actions>
              <Modal.Close render={<Button />}>Save</Modal.Close>
              <Modal.Close render={<Button hierarchy="secondary" />}>Cancel</Modal.Close>
            </Modal.Actions>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
