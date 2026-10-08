import {CloseIcon} from '@earendil-works/elanor-icons-react';

import {Button} from '../button/button.tsx';
import {IconButton} from '../icon-button/icon-button.tsx';
import {Modal} from './index.ts';

import styles from './modal.example.module.css';

export function ModalExample(): React.JSX.Element {
  return (
    <Modal.Root>
      <Modal.Trigger render={<Button />}>View project details</Modal.Trigger>
      <Modal.Portal>
        <Modal.Backdrop />
        <Modal.Viewport>
          <Modal.Popup>
            <div className={styles.header}>
              <Modal.Title className={styles.title}>Project details</Modal.Title>
              <Modal.Close render={<IconButton aria-label="Close" />}>
                <CloseIcon aria-hidden="true" />
              </Modal.Close>
            </div>
            <Modal.Description>Settings shared by everyone in this workspace.</Modal.Description>
            <Modal.Body>New members inherit the project’s current access settings.</Modal.Body>
            <Modal.Actions>
              <Modal.Close render={<Button hierarchy="secondary" />}>Cancel</Modal.Close>
            </Modal.Actions>
          </Modal.Popup>
        </Modal.Viewport>
      </Modal.Portal>
    </Modal.Root>
  );
}
