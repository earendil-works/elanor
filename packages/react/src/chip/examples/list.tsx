import {DraftIcon} from '@earendil-works/elanor-icons-react';
import {Chip} from '@earendil-works/elanor-react';

import styles from './chip.module.css';

const files = ['brief.pdf', 'wireframes.png', 'notes.md'];

export default function ChipList() {
  return (
    <ul className={styles.list} aria-label="Attached files">
      {files.map((file) => (
        <Chip.Root key={file} render={<li />}>
          <Chip.Icon>
            <DraftIcon />
          </Chip.Icon>
          <Chip.Label>{file}</Chip.Label>
        </Chip.Root>
      ))}
    </ul>
  );
}
