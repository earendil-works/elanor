import {Field} from '@earendil-works/elanor-react';

import styles from './control.module.css';

export default function FieldControl() {
  return (
    <Field.Root name="accent">
      <Field.Label>Accent color</Field.Label>
      <Field.Control type="color" defaultValue="#2b6584" className={styles.color} />
    </Field.Root>
  );
}
