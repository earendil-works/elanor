import {Dialog as BaseDialog} from '@base-ui/react/dialog';
import {ChevronLeftIcon, ChevronRightIcon, CloseIcon} from '@earendil-works/elanor-icons-react';
import {useEffect, useRef, useState, type KeyboardEvent} from 'react';

import {IconButton} from '../icon-button/icon-button.tsx';
import {attachImageGestures} from './gestures.ts';

import styles from './image-viewer.module.css';

/** An image the viewer shows. */
export interface ImageViewerImage {
  /** The image's URL, such as a data URL. */
  readonly src: string;
  /** Describes the image; empty when the surrounding content already does. */
  readonly alt?: string | undefined;
}

export interface ImageViewerProps {
  /** The images the reader can step through, in order. */
  readonly images: readonly ImageViewerImage[];
  /** The index of the image shown, or `undefined` while the viewer is closed. */
  readonly index: number | undefined;
  /** Called with the index of another image, or `undefined` to close. */
  readonly onIndexChange: (index: number | undefined) => void;
  /** The Close button's accessible name. */
  readonly closeLabel?: string | undefined;
  /** The previous-image button's accessible name. */
  readonly previousLabel?: string | undefined;
  /** The next-image button's accessible name. */
  readonly nextLabel?: string | undefined;
}

/**
 * An image full screen, on a dark stage, as large as it fits. Pinch to zoom, pan and double-tap like a phone's photo
 * viewer; drag the image away, tap beside it, press Escape or use Close to close. Several images are a swipe, an arrow
 * key or a side button apart. A modal dialog: it traps focus and returns it to what opened it.
 */
export function ImageViewer({
  images,
  index,
  onIndexChange,
  closeLabel = 'Close',
  previousLabel = 'Previous image',
  nextLabel = 'Next image',
}: ImageViewerProps) {
  const image = index === undefined ? undefined : images[index];
  const several = images.length > 1;
  const go = (step: number) => {
    if (index !== undefined) onIndexChange((index + step + images.length) % images.length);
  };
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const picture = useRef<HTMLImageElement>(null);
  const backdrop = useRef<HTMLDivElement>(null);
  const popup = useRef<HTMLDivElement>(null);
  const latest = useRef({go, onIndexChange});
  useEffect(() => {
    latest.current = {go, onIndexChange};
  });
  const gestures = useRef<ReturnType<typeof attachImageGestures>>(undefined);
  useEffect(() => {
    if (!stage) return undefined;
    gestures.current = attachImageGestures(stage, {
      image: () => picture.current,
      backdrop: () => backdrop.current,
      onClose: () => latest.current.onIndexChange(undefined),
      onSwipe: (direction) => latest.current.go(direction),
      onTapOutside: () => latest.current.onIndexChange(undefined),
      // While the image is dragged away its controls give way; after a drag the viewer leaves without fading again.
      onDragging: (dragging) => popup.current?.toggleAttribute('data-dragging', dragging),
    });
    return () => gestures.current?.detach();
  }, [stage]);
  // Another image starts unzoomed.
  useEffect(() => gestures.current?.reset(), [index]);
  const onKeyDown = (event: KeyboardEvent) => {
    if (!several) return;
    if (event.key === 'ArrowRight') go(1);
    if (event.key === 'ArrowLeft') go(-1);
  };
  return (
    <BaseDialog.Root
      open={image !== undefined}
      onOpenChange={(open) => {
        if (!open) onIndexChange(undefined);
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop ref={backdrop} className={styles.backdrop} />
        <BaseDialog.Popup
          ref={popup}
          className={styles.popup}
          aria-label={image?.alt || `Image ${(index ?? 0) + 1} of ${images.length}`}
          onKeyDown={onKeyDown}
        >
          <div ref={setStage} className={styles.stage}>
            {image && (
              <img
                ref={picture}
                className={styles.image}
                src={image.src}
                alt={image.alt ?? ''}
                draggable={false}
              />
            )}
          </div>
          <BaseDialog.Close
            render={<IconButton className={styles.close} aria-label={closeLabel} />}
          >
            <CloseIcon />
          </BaseDialog.Close>
          {several && (
            <>
              <IconButton
                className={styles.step}
                data-side="previous"

                aria-label={previousLabel}
                onClick={() => go(-1)}
              >
                <ChevronLeftIcon />
              </IconButton>
              <IconButton
                className={styles.step}
                data-side="next"

                aria-label={nextLabel}
                onClick={() => go(1)}
              >
                <ChevronRightIcon />
              </IconButton>
              <output className={styles.count}>
                {(index ?? 0) + 1} / {images.length}
              </output>
            </>
          )}
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
