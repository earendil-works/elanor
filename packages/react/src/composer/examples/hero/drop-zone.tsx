import {Composer} from '@earendil-works/elanor-react';
import {useRef, useState, type DragEvent, type ReactNode} from 'react';

import styles from '../composer.module.css';

const hasFiles = (event: DragEvent) => event.dataTransfer.types.includes('Files');

/** The view around the composer: files dropped anywhere on it go in at the prompt's caret. */
export function DropZone({children}: {children: ReactNode}) {
  const {attach} = Composer.useActions();
  const [dragging, setDragging] = useState(false);
  // A drag entering a child leaves its parent, so count to know when it leaves the view.
  const depth = useRef(0);

  return (
    <div
      className={styles.view}
      onDragEnter={(event) => {
        if (!hasFiles(event)) return;
        depth.current += 1;
        setDragging(true);
      }}
      onDragLeave={(event) => {
        if (!hasFiles(event)) return;
        depth.current -= 1;
        if (depth.current === 0) setDragging(false);
      }}
      onDragOver={(event) => {
        if (event.defaultPrevented || !hasFiles(event)) return;
        // Allows the drop.
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
      }}
      onDrop={(event) => {
        depth.current = 0;
        setDragging(false);
        const files = [...event.dataTransfer.files];
        if (event.defaultPrevented || !files.length) return; // The composer took it, or no files.
        event.preventDefault();
        attach(files);
      }}
    >
      {children}
      {dragging ? (
        <div className={styles.dropTarget}>
          <span className={styles.dropLabel}>Drop files to attach</span>
        </div>
      ) : null}
    </div>
  );
}
